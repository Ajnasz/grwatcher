/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');
  GRW.Token(function() {alert(GRW.token)});
  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
