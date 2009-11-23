(function() {
  var getlist = new GRW.GetList(),
      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent',
      statusbarIcon =  GRW.UI.StatusbarIcon,
      statusbarCounter = GRW.UI.StatusbarCounter;


  var requester = function() {

    getlist.on('unreadGeneratedEvent', function(elems) {
      GRW.log('unread generated event');
      (elems.unreadSum > 0)
        ? statusbarIcon.setReaderStatus('on')
        : statusbarIcon.setReaderStatus('off');

      statusbarCounter.update(elems.unreadSum, elems.unreadSum);
      GRW.log('aaa');
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
    getlist.on('requestStartEvent', function() {
      statusbarIcon.setReaderStatus('load');
    });
    getlist.on('requestErrorEvent', function() {
      statusbarIcon.setReaderStatus('error');
    });

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
  GRW.augmentProto(requester, GRW.EventProvider);
  GRW.module('Requester', requester);
})();
