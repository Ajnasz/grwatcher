(function() {
  const toolbarButtonID = 'GRW-toolbar-button';
  var setTooltip = function(win, toolbarTooltip) {
      var toolbarButton = win.document.getElementById(toolbarButtonID);
      if(toolbarButton) {
        toolbarButton.tooltip = toolbarTooltip;
      }
  };

  var actions = {
    genGrid: function(win, feeds, getlist, cache) {
      var cache = cache || {};
      var activeGRW = cache.activeGRW || GRW.getActiveGRW().GRW;
      var toolbar = win.document.getElementById(toolbarButtonID);
      var showItemsInToolTip = GRW.Prefs.get.showitemsintooltip();
      if(showItemsInToolTip) {
        var getlist = cache.getlist || activeGRW.GetList;
        var feeds = cache.feeds || activeGRW.feeds;
        var labels = cache.labels || getlist.getLabels();

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
      } else {
        setTooltip(win, 'GRW-toolbar-tooltip-new');
      }

    },
    error: function(win) {
      setTooltip(win, 'GRW-toolbar-tooltip-error');
    },
    nonew: function(win) {
      setTooltip(win, 'GRW-toolbar-tooltip-nonew');
    },
    cookieError: function(win) {
      setTooltip(win, 'GRW-toolbar-tooltip-cookieerror');
    },
    networkError: function(win) {
      setTooltip(win, 'GRW-ttb-tooltip-networkerror');
    },
    loginError: function(win) {
      setTooltip(win, 'GRW-statusbar-tooltip-loginerror');
    },
  };
  var toolbarTooltip = function(action, feeds, getlist) {
    GRW.log('ttolbar tooltip called');
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
  GRW.UI.ToolbarTooltip = toolbarTooltip;
})();
