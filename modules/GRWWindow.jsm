var customDefs = {
    2: 'dblclick',
    1: 'click'
};
var scope = {};
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
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
GRWWindow.requestFailed = 'requestFailed';
GRWWindow.requestStarted = 'requestStarted';
GRWWindow.requestSuccess = 'requestSuccess';
GRWWindow.prototype = {
    elements: ['GRW-toolbar-button', 'GRW-toolbar-label', 'GRW-statusbar'],
    updateCounter: function () {
    },
    generateMenu: function () {
    },
    generateTooltip: function () {
    },
    handleClick: function (e) {
        var name = '';
        switch (e.button) {
        case 0:
            name = 'iconClick';
            break;
        case 1:
            name = 'iconMiddleClick';
            break;
        }
        if (name !== '') {
            Components.utils.import("resource://grwmodules/prefs.jsm", scope);
            if (customDefs[scope.prefs.get.leftClickOpen()] === e.type) {
                this.fireEvent(name, [e.type, e]);
            }
        }
    },
    onDocClick: function () {
        var that = this;
        return function (e) {
            var targetId = e.target.id;
            if (that.elements.some(function (id) {
                return id === targetId;
            })) {
                that.handleClick(e);
            }
        };
    },
    listenClicks: function () {
        this.doc.addEventListener('click', this.onDocClick(), false);
        this.doc.addEventListener('dblclick', this.onDocClick(), false);
    },
    updateIcon: function (status) {
        var that = this;
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        ['GRW-toolbar-button', 'GRW-statusbar'].forEach(function (elemId) {
            var elem = that.doc.getElementById(elemId), classes;
            scope.grwlog('updat elem: ' + elemId, elem, status);
            if (elem) {
                classes = elem.getAttribute('class').split(' ').filter(function (cl) {
                    return cl !== '' && cl !== 'on' && cl !== 'off' && cl !== 'error' && cl !== 'load';
                });
                classes.push(status);
                elem.setAttribute('class', classes.join(' '));
            }
        });
    },
    notify: function (event, args) {
        switch (event) {
        case GRWWindow.requestFailed:
            this.updateIcon('error');
            break;
        case GRWWindow.requestStarted:
            this.updateIcon('load');
            break;
        case GRWWindow.requestSuccess:
            this.updateIcon('off');
            break;
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
