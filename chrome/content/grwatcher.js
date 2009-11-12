/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');
  var a = new GRW.Ajax({url: 'http://google.com'});
  a.send();
  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
