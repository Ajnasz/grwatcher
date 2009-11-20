(function() {
  var getlist = new GRW.GetList();

  getlist.on('unreadGeneratedEvent', function(elems) {
    GRW.log('unread generated event');
  });

  getlist.on('subscriptionGeneratedEvent', function(elems) {
    GRW.log('subscription list generated event');
  });

  getlist.on('itemsMatchedEvent', function() {
    GRW.log('items matched event');
    GRW.Notifier(this._unreadCount.unreadSum);
  });

  getlist.on('unreadAndSubscriptionReceivedEvent', function() {
    this.matchUnreadItems();
  });

  var requester = function() {
    getlist.start();
    this.setNext();
  };
  requester.prototype = {
    updater: function() {
      GRW.log('updater');
      getlist.getUnreadCount();
      this.setNext();
    },
    setNext: function() {
      if(this.timer) {
        GRW.clearTimeout(this.timer);
      }
      var _this = this,
          minCheck = 1,
          configuredCheck = GRW.Prefs.get.checkFreq(),
          freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
      // this.timer = GRW.setTimeout(function() {_this.updater()}, GRW.Prefs.get.delayStart());
      this.timer = GRW.setTimeout(function() {_this.updater()}, freq*1000*60);
      GRW.log('setNext');
    }
  };
  GRW.Requester = requester;
})();
