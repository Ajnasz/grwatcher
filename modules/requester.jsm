/*jslint indent: 2*/
// var getlist = GRW.GetList;
var Requester = function (getlist) {
  this.getlist = getlist;
};
Requester.prototype = {
  start: function() {
    this.getlist.start();
    this.setNext();
  },
  updater: function() {
    this.getlist.getUnreadCount();
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
augmentProto(Requester, EventProvider);

let EXPORTED_SYMBOLS = ['Requester'];
