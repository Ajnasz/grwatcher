(function() {

  const statusbarID = 'GRW-statusbar',
    toolbarButtonID = 'GRW-toolbar-button';

  var actions = {
    genGrid: function(win, feeds, getlist) {
      var statusbar = win.document.getElementById(statusbarID);
      var activeGRW = GRW.getActiveGRW().GRW; 
      var getlist = activeGRW.GetList;
      var feeds = activeGRW.feeds;
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-new';
        var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');
        var labels = getlist.getLabels();
        var grid = new GRW.UI.Grid(win.document, feeds, labels).getGrid();
        while(tooltipContainer.firstChild) {
          tooltipContainer.removeChild(tooltipContainer.firstChild);
        }
        tooltipContainer.appendChild(grid);
        new Menu(win, feeds, labels);
      }
    },
    error: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-error';
        if(ttb)ttb.setAttribute('tooltiptext', GRW.strings.getString('errorfeedfetch'));
      }
    },
    nonew: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-nonew';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('nonewfeed'));
      }
    },
    cookieError: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-cookieerror';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('cookieerror'));
      }
    },
    networkError: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-networkerror';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('networkerror'));
      }
    },
    loginError: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-loginerror';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('errorlogin'));
      }
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
    }
    if(actionMethod) {
      GRW.UI.MapWindows(actionMethod, [feeds, getlist]);
    }
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
