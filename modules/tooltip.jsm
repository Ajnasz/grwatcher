/*jslint indent:2*/
var Tooltip = function (conf, GRW, openReader) {
  this.conf = conf;
  var setTooltip = function(win, tooltip) {
    var element = win.document.getElementById(conf.elementID);
    if(element) {
      element.tooltip = tooltip;
    }
  };
  var actions = {
    genGrid: function(win, feeds, labels) {
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      var element = win.document.getElementById(conf.elementID);
      var showItemsInToolTip = Prefs.get.showitemsintooltip();
      var elementContainer = win.document.getElementById(conf.tooltipNewElement);

      if(element) {
        element.tooltip = conf.tooltipNewElement;
        if (elementContainer) {
          while(elementContainer.firstChild) {
            elementContainer.removeChild(elementContainer.firstChild);
          }
        }
        if (showItemsInToolTip) {
          var grid = new GRW.UI.Grid(win.document, feeds, labels).getGrid();
          elementContainer.appendChild(grid);
        } else {
          setTooltip(win, conf.tooltipNewElement);
        }
      }
    },
    error: function(win) {
      setTooltip(win, conf.tooltipErrorElement);
    },
    nonew: function(win) {
      setTooltip(win, conf.tooltipNoNewElement);
    },
    cookieError: function(win) {
      setTooltip(win, conf.tooltipCookieErrorElement);
    },
    networkError: function(win) {
      setTooltip(win, conf.tooltipTtbNetworkErrorElement);
    },
    loginError: function(win) {
      setTooltip(win, conf.tooltipLoginErrorElement);
    },
  };
  var _Tooltip = function(action, feeds) {
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
      Components.utils.import("resource://grwmodules/mapwindows.jsm");
      Components.utils.import("resource://grwmodules/getactivegrw.jsm");
      var activeGRW = getActiveGRW().GRW;
      var feeds = activeGRW.feeds;
      var getlist = activeGRW.GetList;
      mapwindows(function(win) {
        var labels = getlist.getLabels();
        actionMethod.call(this, win, feeds, labels);
        menu = new GRW.UI.Menu(win, feeds, labels,
          conf.menuItem, conf.menuItemSeparator, openReader);
      });
    }
  };
  return _Tooltip;
};

let EXPORTED_SYMBOLS = ['Tooltip'];
