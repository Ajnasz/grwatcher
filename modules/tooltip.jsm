/*jslint indent:2*/
var scope = {};
var Tooltip = function (conf, GRW, openReader) {
  this.conf = conf;
  var setTooltip, actions, _Tooltip;
  setTooltip = function (win, tooltip) {
    var element = win.document.getElementById(conf.elementID);
    if (element) {
      element.tooltip = tooltip;
    }
  };
  actions = {
    genGrid: function (win, feeds, labels) {
      Components.utils.import("resource://grwmodules/prefs.jsm", scope);
      Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
      var element = win.document.getElementById(conf.elementID),
        showItemsInToolTip = scope.prefs.get.showitemsintooltip(),
        elementContainer = win.document.getElementById(conf.tooltipNewElement),
        grid;

      if (element) {
        element.tooltip = conf.tooltipNewElement;
        if (elementContainer) {
          while (elementContainer.firstChild) {
            elementContainer.removeChild(elementContainer.firstChild);
          }
        }
        if (showItemsInToolTip) {
          Components.utils.import("resource://grwmodules/GrwTooltipGrid.jsm", scope);
          grid = new scope.GrwTooltipGrid(win.document, feeds, labels).getGrid();
          scope.grwlog(elementContainer);
          elementContainer.appendChild(grid);
        } else {
          setTooltip(win, conf.tooltipNewElement);
        }
      }
    },
    error: function (win) {
      setTooltip(win, conf.tooltipErrorElement);
    },
    nonew: function (win) {
      setTooltip(win, conf.tooltipNoNewElement);
    },
    cookieError: function (win) {
      setTooltip(win, conf.tooltipCookieErrorElement);
    },
    networkError: function (win) {
      setTooltip(win, conf.tooltipTtbNetworkErrorElement);
    },
    loginError: function (win) {
      setTooltip(win, conf.tooltipLoginErrorElement);
    }
  };
  _Tooltip = function (action) {
    var actionMethod, menu, feeds;
    switch (action) {
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
    if (actionMethod) {
      Components.utils.import("resource://grwmodules/mapwindows.jsm", scope);
      Components.utils.import("resource://grwmodules/getList.jsm", scope);
      Components.utils.import("resource://grwmodules/grwMenu.jsm", scope);
      feeds = scope.getList.getLastFeeds();
      scope.mapwindows(function (win) {
        var labels = scope.getList.getLabels(), menu;
        actionMethod.call(this, win, feeds, labels);
        menu = new scope.GrwMenu(win, feeds, labels,
          conf.menuItem, conf.menuItemSeparator, openReader);
      });
    }
  };
  return _Tooltip;
};

let EXPORTED_SYMBOLS = ['Tooltip'];
