/**
 * initialization function
 */
GRW.init = function() {
  GRW.strings = document.getElementById('grwatcher-strings');
  GRW.OpenReader.on('readerOpen', function() {
    GRW.log('reader open');
    GRW.UI.StatusbarIcon.setReaderStatus('off');
    GRW.UI.StatusbarCounter.update(0);
  });
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');

  var statusbarClick = new GRW.StatusbarClick();
  var notifier = new GRW.Notifier();
  var menuClick = new GRW.MenuClick();
  GRW.setTimeout(function() {
    requester = new GRW.Requester();
    requester.on('listItemsMatched', function(getlist) {
      GRW.log('listItemsMatched FIRE');
      notifier.show(getlist._unreadCount.unreadSum);
    });
    notifier.on('notifierClicked', function() {
      GRW.log('notifier clicked');
      GRW.OpenReader.open();
    });
    requester.start();
    statusbarClick.on('statusbarMiddleClick', function() {
      requester.updater();
    });
  }, GRW.Prefs.get.delayStart());
  statusbarClick.on('statusbarClick', function() {GRW.OpenReader.open()});
  menuClick.on('openReader', function() {
    GRW.OpenReader.open();
  });
  menuClick.on('openPreferences', function() {
    window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
  });
  menuClick.init();


  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
