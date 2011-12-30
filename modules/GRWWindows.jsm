var scope = {};
Components.utils.import("resource://grwmodules/GRWWindow.jsm", scope);
/*global Components: true*/
/**
 * Job:
 *  register new windows
 *  unregister closed windows
 *  listen on happenings
 *  notify all GRWWindow objects about any happening.
 *  listen on GRWWindow events: if user clicks on the icon, the icon and the counter may need update
 * Happening could be:
 *  New unread items found
 *  No unread items found
 *  Error: eg.: can't login
 */

Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
var GRWWindows = function () {
    scope.grwlog('initialize grwwindows');
    this.windows = [];
};
GRWWindows.prototype = {
    notify: function (args) {
        this.windows.forEach(function (win) {
            win.notify.apply(win, args);
        });
    },
    add: function (win, doc) {
        var grwWin = new scope.GRWWindow(win, doc);
        this.windows.push(grwWin);
    },
    remove: function (win) {
        var i = 0, wl = this.windows.length, grwWin;
        for (; i < wl; i += 1) {
            if (this.windows[i].win === win) {
                grwWin = this.windows.splice(i, 1);
                grwWin.destroy();
            }
        }
    }
};

var grwWindows = new GRWWindows();
var EXPORTED_SYMBOLS = ['grwWindows'];
