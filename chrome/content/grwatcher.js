/*jslint indent: 2*/
/*global BrowserToolboxCustomizeDone: true, GRW: true*/
(function (GRW) {
  var minDelay = 300,
    scope, isActiveGRW, setIcons, updateUI, getBrowserVersion, tooltipSetter, init, start;
  scope = {};
  isActiveGRW = function () {
    // if (typeof Components === 'undefined') {
    //   return;
    // }
    var isActive = false;
    Components.utils.import("resource://grwmodules/mapwindows.jsm", scope);
    scope.mapwindows(function (win) {
      if (win.GRWActive === true) {
        isActive = true;
      }
    });
    return isActive;
  };
  setIcons = function (status) {
    // if (typeof Components !== 'undefined') {
    Components.utils.import("resource://grwmodules/StatusIcon.jsm", scope);
    // scope.StatusIcon('GRW-statusbar', status);
    scope.StatusIcon('GRW-toolbar-button', status);
    // }
  };
  tooltipSetter = (function () {
    var statusbarConf = {
      elementID: 'GRW-statusbar',
      tooltipNewElement: 'GRW-statusbar-tooltip-new',
      tooltipErrorElement: 'GRW-statusbar-tooltip-error',
      tooltipNoNewElement: 'GRW-statusbar-tooltip-nonew',
      tooltipCookieErrorElement: 'GRW-statusbar-tooltip-cookieerror',
      tooltipNetworkErrorElement: 'GRW-statusbar-tooltip-networkerror',
      tooltipLoginErrorElement: 'GRW-statusbar-tooltip-loginerror',
      tooltipTtbNetworkErrorElement: 'GRW-statusbar-tooltip-networkerror',
      menuItem: 'GRW-statusbar-menu',
      menuItemSeparator: ['GRW-menuseparator', 'GRW-menuseparator-bottom']
    },
    toolbarConf = {
      elementID: 'GRW-toolbar-button',
      tooltipNewElement: 'GRW-toolbar-tooltip-new',
      tooltipErrorElement: 'GRW-toolbar-tooltip-error',
      tooltipNoNewElement: 'GRW-toolbar-tooltip-nonew',
      tooltipCookieErrorElement: 'GRW-toolbar-tooltip-cookieerror',
      tooltipNetworkErrorElement: 'GRW-toolbar-tooltip-networkerror',
      tooltipLoginErrorElement: 'GRW-toolbar-tooltip-loginerror',
      tooltipTtbNetworkErrorElement: 'GRW-toolbar-tooltip-networkerror',
      menuItem: 'GRW-toolbar-menu',
      menuItemSeparator: ['GRW-toolbar-menuseparator', 'GRW-toolbar-menuseparator-bottom']
    };
    return function (action, feeds, getlist, openReader) {
      var scope = {};
      Components.utils.import("resource://grwmodules/tooltip.jsm", scope);
      // scope.Tooltip(statusbarConf, GRW, openReader)(action, feeds, getlist);
      scope.Tooltip(toolbarConf, GRW, openReader)(action, feeds, getlist);
    };
  }());
  updateUI = function (oArgs, openReader) {
    if (GRW.lang.isArray(oArgs.status)) {
      setIcons(oArgs.status);
    }
    if (GRW.lang.isArray(oArgs.tooltip)) {
      oArgs.tooltip.push(openReader);
      tooltipSetter.apply(tooltipSetter, oArgs.tooltip);
    }
    if (GRW.lang.isArray(oArgs.counter)) {
      Components.utils.import("resource://grwmodules/iconCounter.jsm", scope);
      scope.iconCounter.update.apply(scope.iconCounter, oArgs.counter);
    }
  };
  getBrowserVersion = function () {
    var version = null,
        ua = navigator.userAgent.toString(),
        versionMatch;

    if (/Firefox|SeaMonkey/.test(ua)) {
      versionMatch = ua.match(/(?:Firefox|SeaMonkey)\/([\d.]+)/);
      if (versionMatch) {
        version = versionMatch[1];
      }
    }
    return version;
  };


  /**
  * initialization function
  */
  init = function () {
    Components.utils.import("resource://grwmodules/IconClick.jsm", scope);
    Components.utils.import("resource://grwmodules/TooltipHandler.jsm", scope);
    Components.utils.import("resource://grwmodules/OpenReader.jsm", scope);
    Components.utils.import("resource://grwmodules/addToolbarButton.jsm", scope);
    Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);
    Components.utils.import("resource://grwmodules/requester.jsm", scope);
    Components.utils.import("resource://grwmodules/notifier.jsm", scope);

    scope.addToolbarButton(document, navigator, BrowserToolboxCustomizeDone);

    var openReader, iconElements, iconClick, iconTooltipHandler, notifier,
        statusbarClick, toolbarClick, getlist, browserVersion, activeWin, toolbarButton, requester,
        markAllAsRead, showUnreadNotifications;

    openReader = new scope.OpenReader(scope.loginManager);


    iconClick = new scope.IconClick([], document);
    notifier = new scope.Notifier(document);

    /*
    openReader.on('beforeReaderOpened', function () {
      scope.loginManager.setCurrentSID();
    });
    */
    // reset the counter, change the icon,
    // change the next request's time
    // enable to show notification window
    openReader.on('readerOpened', function () {
      Components.utils.import("resource://grwmodules/Prefs.jsm", scope);
      if (scope.Prefs.get.resetCounter()) {
        var oArgs = {
          status: ['off'],
          counter: [0]
        };
        updateUI(oArgs, openReader);
      }
      requester.setNext();
      notifier.showNotification = true;
    });


    Components.utils.import("resource://grwmodules/MenuClick.jsm", scope);
    Components.utils.import("resource://grwmodules/getter.jsm", scope);
    /*
    statusbarClick = new scope.MenuClick('GRW-statusbar-menu',
      [
        {event: 'openReader', id: 'GRW-statusbar-menuitem-openreader' },
        {event: 'markAllAsRead', id: 'GRW-statusbar-menuitem-markallasread'},
        {event: 'checkUnreadFeeds', id: 'GRW-statusbar-menuitem-getcounter'},
        {event: 'openPreferences', id: 'GRW-statusbar-menuitem-openprefs'},
        {event: 'enableCookies', id: 'GRW-statusbar-menuitem-enablecookies'}
      ], document
    );
    */
    toolbarClick = new scope.MenuClick('GRW-toolbar-menu',
      [
        {event: 'openReader', id: 'GRW-toolbar-menuitem-openreader'},
        {event: 'markAllAsRead', id: 'GRW-toolbar-menuitem-markallasread'},
        {event: 'checkUnreadFeeds', id: 'GRW-toolbar-menuitem-getcounter'},
        {event: 'openPreferences', id: 'GRW-toolbar-menuitem-openprefs'},
        {event: 'enableCookies', id: 'GRW-toolbar-menuitem-enablecookies'}
      ], document);
    // var toolbarClick = new GRW.ToolbarMenuClick();
    // var requester = GRW.Requester;
    // var loginManager = GRW.LoginManager;
    Components.utils.import("resource://grwmodules/getlist.jsm", scope);
    getlist = scope.getList;
    requester = new scope.Requester(getlist);

    GRW.strings = document.getElementById('grwatcher-strings');
    scope.getter.onStartRequest.subscribe(function () {
      updateUI({status: ['load']}, openReader);
    });
    browserVersion = parseInt(getBrowserVersion(), 10);
    scope.getter.onRequestFailed.subscribe(function (request) {
      var oArgs = {status: ['error']};
      if (request) {
        oArgs.tooltip = ['error'];
      } else {
        if (type === 'networkerror') {
          oArgs.tooltip = ['networkerror'];
        } else {
          oArgs.tooltip = ['error'];
        }
      }
      updateUI(oArgs, openReader);
    });
    scope.getter.onRequestSuccess.subscribe(function () {
      setIcons('off');
    });

    // show error icon if login failed
    scope.loginManager.on('loginFailed', function () {
      var oArgs = {
        status: ['error'],
        counter: [0],
        tooltip: ['loginerror']
      };
      updateUI(oArgs, openReader);
    });
    scope.loginManager.on('cookieError', function () {
      var oArgs = {
        status: ['error'],
        tooltip: ['cookieerror']
      };
      updateUI(oArgs, openReader);
    });
    // show notification window every time the unread count
    // and the subscription list matched
    // the notifier will deside if really need to show
    showUnreadNotifications = function () {
      var unreads = getlist.matchedData.unreads,
          max = getlist.matchedData.max,
          elems = getlist._unreadCount,
          oArgs;

      getlist.setLastFeeds(unreads);
      oArgs = {
        tooltip: ['grid', unreads, getlist]
      };
      if (elems.unreadSum > 0) {
        oArgs.status = ['on'];
      } else {
        oArgs.status = ['off'];
        oArgs.tooltip = ['nonew'];
      }
      oArgs.counter = [elems.unreadSum, max];
      updateUI(oArgs, openReader);
    };
    getlist.on('itemsMatchedEvent', function () {
      notifier.show(getlist._unreadCount.unreadSum, getlist.matchedData.max);
    });
    getlist.on('itemsMatchedEvent', showUnreadNotifications);

    // when the unread and the subscription list data is arrived
    // match them
    getlist.on('unreadAndSubscriptionReceivedEvent', function () {
      this.matchUnreadItems();
    });


    // set error icon if request failed
    /*
    getlist.on('requestErrorEvent', function () {
    });
    */


    // update counter when user clicks on the statusbar icon
    // with the middle mouse button
    iconClick.on('iconMiddleClick', function () {
      requester.updater();
    });
    // open the reader when user clicks on the link in the notifier
    notifier.on('notifierClicked', function () {
      openReader.open();
    });

    // Open the reader when user clicks on the statusbar icon
    iconClick.on('iconClick', function () {
      openReader.open();
    });

    Components.utils.import("resource://grwmodules/markallasread.jsm", scope);
    markAllAsRead = new scope.MarkAllAsRead(document);
    markAllAsRead.on('onMarkAllAsRead', function () {
      requester.updater();
    });
    /*
    // open the reader when user clicks on the "Open Reader"
    // menuitem
    statusbarClick.on('openReader', function () {
      openReader.open();
    });

    // update counter when user clicks on the "Check Unread Feeds"
    // menuitem
    statusbarClick.on('checkUnreadFeeds', function () {
      requester.updater();
    });

    // open the preferences window when the user clicks on the
    // "Preferences" menuitem
    statusbarClick.on('openPreferences', function () {
      window.openDialog("chrome://grwatcher/content/grprefs.xul",
        'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
    });
    statusbarClick.on('markAllAsRead', function () {
      scope.MarkAllAsRead.mark();
    });
    statusbarClick.init();
    */

    // open the reader when user clicks on the "Open Reader"
    // menuitem
    toolbarClick.on('openReader', function () {
      openReader.open();
    });

    // update counter when user clicks on the "Check Unread Feeds"
    // menuitem
    toolbarClick.on('checkUnreadFeeds', function () {
      requester.updater();
    });

    // open the preferences window when the user clicks on the
    // "Preferences" menuitem
    toolbarClick.on('openPreferences', function () {
      window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher',
        'chrome,titlebar,toolbar,centerscreen,modal');
    });
    markAllAsRead.on('onMarkAllAsRead', function () {
      requester.updater();
    });
    toolbarClick.on('markAllAsRead', function () {
      markAllAsRead.mark();
    });
    // toolbarClick.init();

    if (isActiveGRW() === false) {
      window.GRWActive = true;
      requester.start();
    } else {
      showUnreadNotifications();
    }

    GRW.onToolbarButtonAdd = function (element, noUpdate) {
      element.oncommand = function () {};
      element.onmouseover = function () {};
      toolbarClick.init();
      iconClick.addElements(['GRW-toolbar-button', 'GRW-toolbar-label']);
      if (!noUpdate) {
        requester.updater();
      }
    };
    /*
    GRW.onStatusbarButtonAdd = function (element) {
      element.oncommand = function () {};
      statusbarClick.init();
      iconClick.addElements(iconElements);
      requester.updater();
    };
    */
    toolbarButton = document.getElementById('GRW-toolbaritem');
    if (toolbarButton) {
      GRW.onToolbarButtonAdd(toolbarButton, true);
    }
  };
  start = function () {
    Components.utils.import("resource://grwmodules/Timer.jsm", scope);
    Components.utils.import("resource://grwmodules/Prefs.jsm", scope);
    var delay = scope.Prefs.get.delayStart();
    delay = delay > minDelay ? delay : minDelay;
    scope.later(function () {
      init();
    }, delay);
  };
  window.addEventListener('load', start, false);
  window.addEventListener('unload', function (event) {
    this.removeEventListener('load', start, false);
  }, false);
}(GRW));
