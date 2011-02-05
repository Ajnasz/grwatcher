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
      Components.utils.import("resource://grwmodules/Timer.jsm");
      if(this.timer) {
        never(this.timer);
      }
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      var _this = this,
          minCheck = 1,
          configuredCheck = Prefs.get.checkFreq(),
          freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;

      this.timer = later(function() {_this.updater()}, freq*1000*60);
    }
  };
  Components.utils.import("resource://grwmodules/Augment.jsm");
  Components.utils.import("resource://grwmodules/EventProvider.jsm");
  augmentProto(requester, EventProvider);
  GRW.module('Requester', new requester());
})();
