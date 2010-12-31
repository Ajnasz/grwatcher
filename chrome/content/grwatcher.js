GRW.isActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var isActive = false;
  GRW.UI.MapWindows(function(win) {
    if(win.GRWActive === true) {
      isActive = true;
    }
  });
  return isActive;
};
GRW.getActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var activeWin = false;
  GRW.UI.MapWindows(function(win) {
    if(win.GRWActive === true) {
      activeWin = win;
    }
  });
  return (activeWin === false) ? window : activeWin;
};
GRW.updateUI = function(oArgs) {
  if(GRW.lang.isArray(oArgs.status)) {
    GRW.UI.StatusbarIcon.setReaderStatus.apply(GRW.UI.StatusbarIcon, oArgs.status);
    GRW.UI.ToolbarIcon.setReaderStatus.apply(GRW.UI.ToolbarIcon, oArgs.status);
  }
  if(GRW.lang.isArray(oArgs.tooltip)) {
    GRW.UI.Tooltip.apply(GRW.UI.Tooltip, oArgs.tooltip);
  }
  if(GRW.lang.isArray(oArgs.counter)) {
    GRW.UI.StatusbarCounter.update.apply(GRW.UI.StatusbarCounter, oArgs.counter);
  }
};
/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');

  var statusbarIcon =  GRW.UI.StatusbarIcon;
  var toolbarIcon =  GRW.UI.ToolbarIcon;
  var statusbarCounter = GRW.UI.StatusbarCounter;
  var iconClick = new GRW.IconrClick();
  var notifier = new GRW.Notifier();
  var menuClick = new GRW.MenuClick();
  var toolbarClick = new GRW.ToolbarMenuClick();
  var requester = GRW.Requester;
  var loginManager = GRW.LoginManager;
  var getlist = GRW.GetList;

  GRW.strings = document.getElementById('grwatcher-strings');
  GRW.getter.onStartRequest.subscribe(function() {
    GRW.updateUI({status: ['load']});
  });
  var browserVersion = GRW.getBrowserVersion();
  if(browserVersion && browserVersion >= 4) {
    GRW.UI.SetToolbarButtonFirstTime();
  }
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
    GRW.updateUI(oArgs);
  });
  GRW.getter.onRequestSuccess.subscribe(function() {
    statusbarIcon.setReaderStatus('off');
    toolbarIcon.setReaderStatus('off');
  });

  // show error icon if login failed
  loginManager.on('loginFailed', function() {
    GRW.log('login failed');
    var oArgs = {
      status: ['error'],
      counter: [0],
      tooltip: ['loginerror'],
    };
    GRW.updateUI(oArgs);
  });
  loginManager.on('cookieError', function() {
    var oArgs = {
      status: ['error'],
      tooltip: ['cookieerror'],
    };
    GRW.updateUI(oArgs);
  });

GRW.OpenReader.on('beforeReaderOpened', function() {
  GRW.log('set current sid');
  loginManager.setCurrentSID();
});
  // reset the counter, change the icon,
  // change the next request's time
  // enable to show notification window
  GRW.OpenReader.on('readerOpened', function() {
    if(GRW.Prefs.get.resetCounter()) {
      var oArgs = {
        status: ['off'],
        counter: [0],
      };
      GRW.updateUI(oArgs);
    };
    requester.setNext();
    notifier.showNotification = true;
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
    GRW.updateUI(oArgs);
  });

  // set statusbar after the unread items processed
  // getlist.on('unreadGeneratedEvent', function(elems) {
  //   GRW.log('unread generated event');
  // });
  //
  // getlist.on('subscriptionGeneratedEvent', function(elems) {
  //   GRW.log('subscription list generated event');
  // });

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
    // GRW.log('notifier clicked');
    GRW.OpenReader.open();
  });

  // Open the reader when user clicks on the statusbar icon
  iconClick.on('iconClick', function() {
    GRW.OpenReader.open()
  });

  // open the reader when user clicks on the "Open Reader"
  // menuitem
  menuClick.on('openReader', function() {
    GRW.OpenReader.open();
  });

  // update counter when user clicks on the "Check Unread Feeds"
  // menuitem
  menuClick.on('checkUnreadFeeds', function() {
    requester.updater();
  });

  // open the preferences window when the user clicks on the
  // "Preferences" menuitem
  menuClick.on('openPreferences', function() {
    window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
  });
  GRW.MarkAllAsRead.on('onMarkAllAsRead',function() {
    requester.updater();
  })
  menuClick.on('markAllAsRead', function() {
    GRW.MarkAllAsRead.mark();
  });

  // open the reader when user clicks on the "Open Reader"
  // menuitem
  toolbarClick.on('openReader', function() {
    GRW.OpenReader.open();
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
  toolbarClick.init();
  menuClick.init();

  if(GRW.isActiveGRW() === false) {
    window.GRWActive = true;
    GRW.later(function() {
      requester.start();
    }, GRW.Prefs.get.delayStart());
  } else {
    var activeWin = GRW.getActiveGRW();
    activeWin.GRW.GetList.matchUnreadItems();
//    getlist = activeWin.GRW.GetList;
  }

  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
