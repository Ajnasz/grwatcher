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
    this.scheduleNext();
  },
  restart: function () {
    "use strict";
    this.getlist.restart();
    this.scheduleNext();
  },
  updater: function () {
    "use strict";
    this.getlist.getUnreadCount();
    this.scheduleNext();
  },
  scheduleNext: function () {
    "use strict";
    Components.utils.import("resource://grwmodules/timer.jsm", context);
    Components.utils.import("resource://grwmodules/prefs.jsm", context);
    Components.utils.import("resource://grwmodules/clientConfigs.jsm", context);

    if (this.timer) {
      context.never(this.timer);
    }

    // get minimum check frequency from config or set to 1
    var minCheck = context.minCheckFreq || 1,
      configuredCheck = context.prefs.get.checkFreq(),
      freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;

    this.timer = context.later(this.updater.bind(this), freq * 1000 * 60);
  }
};

Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);

context.augmentProto(Requester, context.EventProvider);

var EXPORTED_SYMBOLS = ['Requester'];
