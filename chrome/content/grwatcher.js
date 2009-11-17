/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');
  GRW.log('account exists', GRW.AccountManager.getCurrentSID());
  GRW.log('account login', GRW.AccountManager.logIn(function() {
    GRW.log('account exists2', GRW.AccountManager.getCurrentSID());
  }));
  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
