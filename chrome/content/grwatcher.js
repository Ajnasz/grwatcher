/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');

  var statusbarClick = new GRW.StatusbarClick();
  var notifier = new GRW.Notifier();
  var menuClick = new GRW.MenuClick();
  var requester = GRW.Requester;
  var loginManager = GRW.LoginManager;
  var getlist = GRW.GetList;

  GRW.strings = document.getElementById('grwatcher-strings');

  // show error icon if login failed
  loginManager.on('loginFailed', function() {
    GRW.log('login failed');
    GRW.UI.StatusbarIcon.setReaderStatus('error');
    GRW.UI.StatusbarCounter.update(0);
  });

  // reset the counter, change the icon,
  // change the next request's time
  // enable to show notification window
  GRW.OpenReader.on('readerOpened', function() {
    GRW.log('reader open');
    if(GRW.Prefs.get.resetCounter()) {
      GRW.UI.StatusbarIcon.setReaderStatus('off');
      GRW.UI.StatusbarCounter.update(0);
    };
    requester.setNext();
    notifier.showNotification = true;
  });

  // show notification window every time the unread count
  // and the subscription list matched
  // the notifier will deside if really need to show
  getlist.on('listItemsMatched', function(getlist) {
    GRW.log('listItemsMatched FIRE');
    notifier.show(getlist._unreadCount.unreadSum);
  });

  // set statusbar after the unread items processed
  getlist.on('unreadGeneratedEvent', function(elems) {
    GRW.log('unread generated event');
    (elems.unreadSum > 0)
      ? statusbarIcon.setReaderStatus('on')
      : statusbarIcon.setReaderStatus('off');

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
  getlist.on('requestStartEvent', function() {
    statusbarIcon.setReaderStatus('load');
  });
  // set error icon if request failed
  getlist.on('requestErrorEvent', function() {
    GRW.log('request error');
    statusbarIcon.setReaderStatus('error');
  });

  // open the reader when user clicks on the link in the notifier
  notifier.on('notifierClicked', function() {
    GRW.log('notifier clicked');
    GRW.OpenReader.open();
  });

  // update counter when user clicks on the statusbar icon
  // with the middle mouse button
  statusbarClick.on('statusbarMiddleClick', function() {
    requester.updater();
  });

  // Open the reader when user clicks on the statusbar icon
  statusbarClick.on('statusbarClick', function() {
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
