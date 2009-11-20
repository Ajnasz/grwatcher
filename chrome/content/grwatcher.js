/**
 * initialization function
 */
GRW.init = function() {
  GRW.strings = document.getElementById('grwatcher-strings');
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');

  GRW.setTimeout(function() {
    new GRW.Requester();
  }, GRW.Prefs.get.delayStart());
  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
