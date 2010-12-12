(function() {

  const statusbarID = 'GRW-statusbar';

  var setTooltip = function(win, statusbarTooltip) {
    var statusbar = win.document.getElementById(statusbarID);
    if(statusbar) {
      statusbar.tooltip = statusbarTooltip;
    }
  };

  var actions = {
    genGrid: function(win, feeds, labels) {
      var statusbar = win.document.getElementById(statusbarID);
      var showItemsInToolTip = GRW.Prefs.get.showitemsintooltip();
      var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');

      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-new';
        while(tooltipContainer.firstChild) {
          tooltipContainer.removeChild(tooltipContainer.firstChild);
        }
        if(showItemsInToolTip) {
          var grid = new GRW.UI.Grid(win.document, feeds, labels).getGrid();
          tooltipContainer.appendChild(grid);
        }
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
  var statusbarTooltip = function(action, feeds) {
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
      GRW.UI.MapWindows(function(win) {
        var activeGRW = GRW.getActiveGRW().GRW;
        var feeds = activeGRW.feeds;
        var getlist = activeGRW.GetList;
        var labels = getlist.getLabels();
        actionMethod.call(this, win, feeds, labels);
        new GRW.UI.Menu(win, feeds, labels, 'GRW-statusbar-menu', 'GRW-menuseparator');
      });
    }
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
