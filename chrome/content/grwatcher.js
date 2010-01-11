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
  var requester = GRW.Requester;
  var loginManager = GRW.LoginManager;
  var getlist = GRW.GetList;

  GRW.strings = document.getElementById('grwatcher-strings');
  GRW.Ajax.onRequestFailed.subscribe(function(type, request) {
    statusbarIcon.setReaderStatus('error');
    toolbarIcon.setReaderStatus('error');
    if(request) {
      GRW.UI.StatusbarTooltip('error');
      GRW.log('request: ', request.toSource());
    } else {
      if(type == 'networkerror') {
        GRW.UI.StatusbarTooltip('networkerror');
      } else {
        GRW.UI.StatusbarTooltip('error');
      }
    }
  });
  GRW.Ajax.onStartRequest.subscribe(function() {
    statusbarIcon.setReaderStatus('load');
    toolbarIcon.setReaderStatus('load');
  });
  /*
  GRW.Ajax.onRequestSuccess.subscribe(function() {
    statusbarIcon.setReaderStatus('off');
    toolbarIcon.setReaderStatus('off');
  });
  */

  // show error icon if login failed
  loginManager.on('loginFailed', function() {
    GRW.log('login failed');
    statusbarIcon.setReaderStatus('error');
    toolbarIcon.setReaderStatus('error');
    GRW.UI.StatusbarCounter.update(0);
    GRW.UI.StatusbarTooltip('loginerror');
  });
  loginManager.on('cookieError', function() {
    statusbarIcon.setReaderStatus('error');
    toolbarIcon.setReaderStatus('error');
    GRW.UI.StatusbarTooltip('cookieerror');
  });

  // reset the counter, change the icon,
  // change the next request's time
  // enable to show notification window
  GRW.OpenReader.on('readerOpened', function() {
    GRW.log('reader open');
    if(GRW.Prefs.get.resetCounter()) {
      statusbarIcon.setReaderStatus('off');
      toolbarIcon.setReaderStatus('off');
      GRW.UI.StatusbarCounter.update(0);
    };
    requester.setNext();
    notifier.showNotification = true;
  });

  // show notification window every time the unread count
  // and the subscription list matched
  // the notifier will deside if really need to show
  getlist.on('itemsMatchedEvent', function(unreads) {
    GRW.log('itemsMatchedEvent FIRE');
    notifier.show(getlist._unreadCount.unreadSum);
    GRW.UI.StatusbarTooltip('grid', unreads, getlist);
  });

  // set statusbar after the unread items processed
  getlist.on('unreadGeneratedEvent', function(elems) {
    GRW.log('unread generated event');
    if (elems.unreadSum > 0) {
      statusbarIcon.setReaderStatus('on')
      toolbarIcon.setReaderStatus('on')
    } else {
      statusbarIcon.setReaderStatus('off');
      toolbarIcon.setReaderStatus('off');
      GRW.UI.StatusbarTooltip('nonew');
    }

    statusbarCounter.update(elems.unreadSum, elems.unreadSum);
  });
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

  // open the reader when user clicks on the link in the notifier
  notifier.on('notifierClicked', function() {
    // GRW.log('notifier clicked');
    GRW.OpenReader.open();
  });

  // update counter when user clicks on the statusbar icon
  // with the middle mouse button
  iconClick.on('iconMiddleClick', function() {
    requester.updater();
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
  menuClick.init();

  GRW.setTimeout(function() {
    requester.start();
  }, GRW.Prefs.get.delayStart());

  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
