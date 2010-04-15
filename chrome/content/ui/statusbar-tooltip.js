(function() {

  const statusbarID = 'GRW-statusbar',
    toolbarButtonID = 'GRW-toolbar-button';

  var setTooltip = function(win, statusbarTooltip, toolbarTooltip) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = statusbarTooltip;
      }
      if(ttb) {
        ttb.tooltip = toolbarTooltip;
      }
  };

  var actions = {
    genGrid: function(win, feeds, getlist) {
      var activeGRW = GRW.getActiveGRW().GRW;
      var toolbar = win.document.getElementById(toolbarButtonID);
      var statusbar = win.document.getElementById(statusbarID);
      var showItemsInToolTip = GRW.Prefs.get.showitemsintooltip();
      if(showItemsInToolTip) {
        var getlist = activeGRW.GetList;
        var feeds = activeGRW.feeds;
        var labels = getlist.getLabels();
        // statusbar

        if(showItemsInToolTip) {
          if(toolbar) {
            toolbar.tooltip = 'GRW-statusbar-tooltip-new';
            var tooltipContainer = win.document.getElementById('GRW-toolbar-tooltip-new');
            var grid = new GRW.UI.Grid(win.document, feeds, labels).getGrid();
            if(tooltipContainer) {
              while(tooltipContainer.firstChild) {
                tooltipContainer.removeChild(tooltipContainer.firstChild);
              }
              tooltipContainer.appendChild(grid);
            }
          }
          if(statusbar) {
            statusbar.tooltip = 'GRW-statusbar-tooltip-new';
            var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');
            var grid = new GRW.UI.Grid(win.document, feeds, labels).getGrid();
            while(tooltipContainer.firstChild) {
              tooltipContainer.removeChild(tooltipContainer.firstChild);
            }
            tooltipContainer.appendChild(grid);
          }
        }
        // toolbar
      } else {
        setTooltip(win, 'GRW-statusbar-tooltip-new', 'GRW-toolbar-tooltip-new');
      }
      if(statusbar) {
        new GRW.UI.Menu(win, feeds, labels);
      }
    },
    error: function(win) {
      setTooltip(win, 'GRW-statusbar-tooltip-error', 'GRW-toolbar-tooltip-error');
    },
    nonew: function(win) {
      setTooltip(win, 'GRW-statusbar-tooltip-nonew','GRW-toolbar-tooltip-nonew');
    },
    cookieError: function(win) {
      setTooltip(win, 'GRW-statusbar-tooltip-cookieerror','GRW-toolbar-tooltip-cookieerror');
    },
    networkError: function(win) {
      setTooltip(win, 'GRW-statusbar-tooltip-networkerror', 'GRW-ttb-tooltip-networkerror');
    },
    loginError: function(win) {
      setTooltip(win, 'GRW-statusbar-tooltip-loginerror', 'GRW-statusbar-tooltip-loginerror');
    },
  };
  var statusbarTooltip = function(action, feeds, getlist) {
    var actionMethod;
    switch(action) {
      case 'grid':
        actionMethod = actions.genGrid;
        break;

      case 'error':
        actionMethod = actions.error;
        break;

      case 'cookieerror':
        actionMethod = actions.cookieError;
        break;

      case 'networkerror':
        actionMethod = actions.networkError;
        break;

      case 'loginerror':
        actionMethod = actions.loginError;
        break;

      case 'nonew':
        actionMethod = actions.nonew;
        break;
    }
    if(actionMethod) {
      GRW.UI.MapWindows(actionMethod, [feeds, getlist]);
    }
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
