(function (GRW) {
  const minDelay = 300;
  var isActiveGRW = function () {
    if (typeof Components === 'undefined') {
      return;
    }
    var isActive = false;
    Components.utils.import("resource://grwmodules/mapwindows.jsm");
    mapwindows(function(win) {
      if(win.GRWActive === true) {
        isActive = true;
      }
    });
    return isActive;
  };
  var setIcons = function (status) {
    if(typeof Components !== 'undefined') {
      Components.utils.import("resource://grwmodules/StatusIcon.jsm");
      StatusIcon('GRW-statusbar', status);
      StatusIcon('GRW-toolbar-button', status);
    } else {
    }
  };
  var updateUI = function (oArgs, openReader) {
    if(GRW.lang.isArray(oArgs.status)) {
      setIcons(oArgs.status)
    }
    if(GRW.lang.isArray(oArgs.tooltip)) {
      oArgs.tooltip.push(openReader);
      GRW.UI.Tooltip.apply(GRW.UI.Tooltip, oArgs.tooltip);
    }
    if(GRW.lang.isArray(oArgs.counter)) {
      GRW.UI.StatusbarCounter.update.apply(GRW.UI.StatusbarCounter, oArgs.counter);
    }
  };
  var getBrowserVersion = function () {
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
  var init = function() {
    Components.utils.import("resource://grwmodules/IconClick.jsm");
    Components.utils.import("resource://grwmodules/TooltipHandler.jsm");
    Components.utils.import("resource://grwmodules/OpenReader.jsm");
    Components.utils.import("resource://grwmodules/addToolbarButton.jsm");

    addToolbarButton(document, navigator, BrowserToolboxCustomizeDone);

    var openReader = new OpenReader();
    openReader.on('beforeReaderOpened', function() {
      loginManager.setCurrentSID();
    });
    // reset the counter, change the icon,
    // change the next request's time
    // enable to show notification window
    openReader.on('readerOpened', function() {
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      if(Prefs.get.resetCounter()) {
        var oArgs = {
          status: ['off'],
          counter: [0],
        };
        updateUI(oArgs, openReader);
      };
      requester.setNext();
      notifier.showNotification = true;
    });


    var statusbarCounter = GRW.UI.StatusbarCounter;
    var iconElements = ['GRW-statusbar'];
    var iconClick = new IconClick(iconElements, document);
    var iconTooltipHandler = new TooltipHandler(iconElements, document);
    var notifier = new GRW.Notifier();
    Components.utils.import("resource://grwmodules/MenuClick.jsm");
    var statusbarClick = new MenuClick(
      [
        {event: 'openReader', id:'GRW-statusbar-menuitem-openreader' },
        {event: 'markAllAsRead', id: 'GRW-statusbar-menuitem-markallasread'},
        {event: 'checkUnreadFeeds', id: 'GRW-statusbar-menuitem-getcounter'},
        {event: 'openPreferences', id: 'GRW-statusbar-menuitem-openprefs'},
        {event: 'enableCookies', id: 'GRW-statusbar-menuitem-enablecookies'}
      ], document
    );
    var toolbarClick = new MenuClick(
      [
        {event: 'openReader', id: 'GRW-toolbar-menuitem-openreader'},
        {event: 'markAllAsRead', id: 'GRW-toolbar-menuitem-markallasread'},
        {event: 'checkUnreadFeeds', id: 'GRW-toolbar-menuitem-getcounter'},
        {event: 'openPreferences', id: 'GRW-toolbar-menuitem-openprefs'},
        {event: 'enableCookies', id: 'GRW-toolbar-menuitem-enablecookies'}
      ], document);
    // var toolbarClick = new GRW.ToolbarMenuClick();
    var requester = GRW.Requester;
    var loginManager = GRW.LoginManager;
    var getlist = GRW.GetList;

    GRW.strings = document.getElementById('grwatcher-strings');
    GRW.getter.onStartRequest.subscribe(function() {
      updateUI({status: ['load']}, openReader);
    });
    var browserVersion = parseInt(getBrowserVersion(), 10);
    GRW.getter.onRequestFailed.subscribe(function(request) {
      var oArgs = {status: ['error']};
      if(request) {
        oArgs.tooltip = ['error'];
      } else {
        if(type == 'networkerror') {
          oArgs.tooltip = ['networkerror'];
        } else {
          oArgs.tooltip = ['error'];
        }
      }
      updateUI(oArgs, openReader);
    });
    GRW.getter.onRequestSuccess.subscribe(function() {
      setIcons('off');
    });

    // show error icon if login failed
    loginManager.on('loginFailed', function() {
      var oArgs = {
        status: ['error'],
        counter: [0],
        tooltip: ['loginerror'],
      };
      updateUI(oArgs, openReader);
    });
    loginManager.on('cookieError', function() {
      var oArgs = {
        status: ['error'],
        tooltip: ['cookieerror'],
      };
      updateUI(oArgs, openReader);
    });
    // show notification window every time the unread count
    // and the subscription list matched
    // the notifier will deside if really need to show
    getlist.on('itemsMatchedEvent', function(args) {
      var unreads = args[0],
          max = args[1],
        elems = getlist._unreadCount;
      GRW.feeds = unreads;
      GRW.max = max;
      notifier.show(elems.unreadSum, max);
      var oArgs = {
        tooltip: ['grid', unreads, getlist],
      };
      if (elems.unreadSum > 0) {
        oArgs.status = ['on'];
      } else {
        oArgs.status = ['off'];
        oArgs.tooltip = ['nonew'];
      }
      oArgs.counter = [elems.unreadSum, max],
      updateUI(oArgs, openReader);
    });

    // when the unread and the subscription list data is arrived
    // match them
    getlist.on('unreadAndSubscriptionReceivedEvent', function() {
      this.matchUnreadItems();
    });

    // show loading when start a request
    /*
    getlist.on('requestStartEvent', function() {
      GRW.UI.StatusbarTooltip('')
    });
    */

    // set error icon if request failed
    /*
    getlist.on('requestErrorEvent', function() {
    });
    */


    // update counter when user clicks on the statusbar icon
    // with the middle mouse button
    iconClick.on('iconMiddleClick', function() {
      requester.updater();
    });
    // open the reader when user clicks on the link in the notifier
    notifier.on('notifierClicked', function() {
      openReader.open();
    });

    // Open the reader when user clicks on the statusbar icon
    iconClick.on('iconClick', function() {
      openReader.open()
    });

    // open the reader when user clicks on the "Open Reader"
    // menuitem
    statusbarClick.on('openReader', function() {
      openReader.open();
    });

    // update counter when user clicks on the "Check Unread Feeds"
    // menuitem
    statusbarClick.on('checkUnreadFeeds', function() {
      requester.updater();
    });

    // open the preferences window when the user clicks on the
    // "Preferences" menuitem
    statusbarClick.on('openPreferences', function() {
      window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
    });
    GRW.MarkAllAsRead.on('onMarkAllAsRead',function() {
      requester.updater();
    })
    statusbarClick.on('markAllAsRead', function() {
      GRW.MarkAllAsRead.mark();
    });

    // open the reader when user clicks on the "Open Reader"
    // menuitem
    toolbarClick.on('openReader', function() {
      openReader.open();
    });

    // update counter when user clicks on the "Check Unread Feeds"
    // menuitem
    toolbarClick.on('checkUnreadFeeds', function() {
      requester.updater();
    });

    // open the preferences window when the user clicks on the
    // "Preferences" menuitem
    toolbarClick.on('openPreferences', function() {
      window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
    });
    GRW.MarkAllAsRead.on('onMarkAllAsRead',function() {
      requester.updater();
    })
    toolbarClick.on('markAllAsRead', function() {
      GRW.MarkAllAsRead.mark();
    });
    // toolbarClick.init();
    statusbarClick.init();

    if(isActiveGRW() === false) {
      window.GRWActive = true;
      requester.start();
    } else {
      Components.utils.import("resource://grwmodules/getactivegrw.jsm");
      var activeWin = getActiveGRW(window);
      activeWin.GRW.GetList.matchUnreadItems();
  //    getlist = activeWin.GRW.GetList;
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
    var toolbarButton = document.getElementById('GRW-toolbaritem');
    if (toolbarButton) {
      GRW.onToolbarButtonAdd(toolbarButton, true);
    }
  };
  var start = function () {
      Components.utils.import("resource://grwmodules/Timer.jsm");
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      var delay = Prefs.get.delayStart();
      delay = delay > minDelay ? delay : minDelay;
      later(function() {
        init();
      }, delay);
  };
  window.addEventListener('load', start, false);
  window.addEventListener('unload', function(event) {
    this.removeEventListener('load', start, false);
  }, false);
}(GRW));
