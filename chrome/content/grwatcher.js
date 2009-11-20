/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Google Reader Watcher ###VERSION### initializitaion started');
  var getlist = new GRW.GetList();
  getlist.on('unreadGeneratedEvent', function(elems) {
    GRW.log('unread generated event');
  });
  getlist.on('subscriptionGeneratedEvent', function(elems) {
    GRW.log('subscription list generated event');
  });
  getlist.on('itemsMatchedEvent', function() {
    GRW.log('items matched event');
  })
  getlist.on('unreadAndSubscriptionReceivedEvent', function() {
    this.matchUnreadItems();
  });
  getlist.start();
  GRW.log('Google Reader Watcher ###VERSION### initializitaion finished');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
