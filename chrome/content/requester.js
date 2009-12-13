(function() {
  var getlist = GRW.GetList,
      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent';


  var requester = function() {};
  requester.prototype = {
    start: function() {
      getlist.start();
      this.setNext();
    },
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
  GRW.augmentProto(requester, GRW.EventProvider);
  GRW.module('Requester', new requester());
})();
