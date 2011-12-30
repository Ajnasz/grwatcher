var customDefs = {
    2: 'dblclick',
    1: 'click'
};
var scope = {};
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/IconClick.jsm", scope);
/**
 * Job: Update UI:
 *    update icon
 *    update counter
 *    generate menu
 *    generate tooltip
 *    handle clicks:
 *        check for unread feeds
 *        open window
 */
var GRWWindow = function (win, doc) {
    this.win = win;
    this.doc = doc;
    this.listenClicks();
};
GRWWindow.hasnew = 'hasnew';
GRWWindow.nonew = 'nonew';
GRWWindow.error = 'error';
GRWWindow.prototype = {
    updateIcon: function () {
    },
    updateCounter: function () {
    },
    generateMenu: function () {
    },
    generateTooltip: function () {
    },
    handleClick: function (e) {
    },
    listenClicks: function () {
    },
    notify: function (event, args) {
        switch (event) {
        case GRWWindow.hasnew:
            // add/update counter,
            // update tooltip: add grid
            // add menu items
            break;
        case GRWWindow.nonew:
            // remove/update counter,
            // update tooltip: must say no new feed found
            // remove feed menu items
            break;
        case GRWWindow.error:
            // remove counter,
            // update tooltip: must say some error message
            // remove feed menu items
            break;
        }
    },
    destroy: function () {
        this.doc = null;
        this.win = null;
        delete this.win;
        delete this.doc;
    }
};
scope.augmentProto(GRWWindow, scope.EventProvider);


var EXPORTED_SYMBOLS = ['GRWWindow'];
