/**
 * initialization function
 */
GRW.init = function() {

  var statusbarClick = new GRW.StatusbarClick();
  var notifier = new GRW.Notifier();
  var menuClick = new GRW.MenuClick();
  var requester = new GRW.Requester();
  GRW.strings = document.getElementById('grwatcher-strings');
  GRW.OpenReader.on('readerOpened', function() {
    GRW.log('reader open');
    if(GRW.Prefs.get.resetCounter()) {
      GRW.UI.StatusbarIcon.setReaderStatus('off');
      GRW.UI.StatusbarCounter.update(0);
    };
    requester.setNext();
    notifier.showNotification = true;
  });
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');

  requester.on('listItemsMatched', function(getlist) {
    GRW.log('listItemsMatched FIRE');
    notifier.show(getlist._unreadCount.unreadSum);
  });

  notifier.on('notifierClicked', function() {
    GRW.log('notifier clicked');
    GRW.OpenReader.open();
  });
  statusbarClick.on('statusbarMiddleClick', function() {
    requester.updater();
  });
  statusbarClick.on('statusbarClick', function() {GRW.OpenReader.open()});
  menuClick.on('openReader', function() {
    GRW.OpenReader.open();
  });
  menuClick.on('checkUnreadFeeds', function() {
    requester.updater();
  });
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
