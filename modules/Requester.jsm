/*jslint indent: 2*/
var context = {};
// var getlist = GRW.GetList;
function Requester(getlist) {
  "use strict";
  this.getlist = getlist;
}
Requester.prototype = {
  start: function () {
    "use strict";
    this.getlist.start();
    this.setNext();
  },
  restart: function () {
    "use strict";
    this.getlist.restart();
    this.setNext();
  },
  updater: function () {
    "use strict";
    this.getlist.getUnreadCount();
    this.setNext();
  },
  setNext: function () {
    "use strict";
    Components.utils.import("resource://grwmodules/timer.jsm", context);
    Components.utils.import("resource://grwmodules/prefs.jsm", context);

    if (this.timer) {
      context.never(this.timer);
    }

    var minCheck = 1,
      configuredCheck = context.prefs.get.checkFreq(),
      freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;

    this.timer = context.later(this.updater.bind(this), freq * 1000 * 60);
  }
};

Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);

context.augmentProto(Requester, context.EventProvider);

var EXPORTED_SYMBOLS = ['Requester'];
