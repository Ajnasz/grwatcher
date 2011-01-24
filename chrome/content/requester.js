(function() {
  var getlist = GRW.GetList;


  var requester = function() {};
  requester.prototype = {
    start: function() {
      getlist.start();
      this.setNext();
    },
    updater: function() {
      getlist.getUnreadCount();
      this.setNext();
    },
    setNext: function() {
      if(this.timer) {
        GRW.never(this.timer);
      }
      var _this = this,
          minCheck = 1,
          configuredCheck = GRW.Prefs.get.checkFreq(),
          freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
      // this.timer = GRW.later(function() {_this.updater()}, GRW.Prefs.get.delayStart());
      this.timer = GRW.later(function() {_this.updater()}, freq*1000*60);
      GRW.log('setNext');
    }
  };
  Components.utils.import("resource://grwmodules/Augment.jsm");
  augmentProto(requester, GRW.EventProvider);
  GRW.module('Requester', new requester());
})();
