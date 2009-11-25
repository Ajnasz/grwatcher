(function() {
  var getlist = new GRW.GetList(),
      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent',
      statusbarIcon =  GRW.UI.StatusbarIcon,
      statusbarCounter = GRW.UI.StatusbarCounter;


  var requester = function() {
    var _this = this;

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
      _this.fireEvent('listItemsMatched', getlist);
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

  };
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
  GRW.module('Requester', requester);
})();
