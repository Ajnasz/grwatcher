/*jslint indent: 2*/
var scope = {};
// var getlist = GRW.GetList;
var Requester = function (getlist) {
  this.getlist = getlist;
};
Requester.prototype = {
  start: function () {
    this.getlist.start();
    this.setNext();
  },
  updater: function () {
    this.getlist.getUnreadCount();
    this.setNext();
  },
  setNext: function () {
    Components.utils.import("resource://grwmodules/Timer.jsm", scope);
    if (this.timer) {
      scope.never(this.timer);
    }
    Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    var _this = this,
        minCheck = 1,
        configuredCheck = scope.prefs.get.checkFreq(),
        freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;

    this.timer = scope.later(function () {
      _this.updater();
    }, freq * 1000 * 60);
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(Requester, scope.EventProvider);

let EXPORTED_SYMBOLS = ['Requester'];
