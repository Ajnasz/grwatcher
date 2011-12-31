var customDefs = {
    2: 'dblclick',
    1: 'click'
};
var scope = {};

var tooltipElements = {
    'GRW-statusbar': {
        tooltipNewElement: 'GRW-statusbar-tooltip-new',
        tooltipErrorElement: 'GRW-statusbar-tooltip-error',
        nonew: 'GRW-statusbar-tooltip-nonew',
        cookieError: 'GRW-statusbar-tooltip-cookieerror',
        networkError: 'GRW-statusbar-tooltip-networkerror',
        logionFailed: 'GRW-statusbar-tooltip-loginerror',
        menuItem: 'GRW-statusbar-menu',
        barname: 'statusbar'
    },
    'GRW-toolbar-button': {
        tooltipNewElement: 'GRW-toolbar-tooltip-new',
        tooltipErrorElement: 'GRW-toolbar-tooltip-error',
        nonew: 'GRW-toolbar-tooltip-nonew',
        cookieError: 'GRW-toolbar-tooltip-cookieerror',
        networkError: 'GRW-toolbar-tooltip-networkerror',
        loginFailed: 'GRW-toolbar-tooltip-loginerror',
        menuItem: 'GRW-toolbar-menu',
        barname: 'toolbar'
    }
};

Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/IconClick.jsm", scope);
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
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
    this.subscribeToMenuCommand();
};

GRWWindow.unreadFound = 'unreadFound';
GRWWindow.nonew = 'nonew';
GRWWindow.load = 'load';
GRWWindow.error = 'error';

GRWWindow.requestFailed = 'requestFailed';
GRWWindow.requestStarted = 'requestStarted';
GRWWindow.requestSuccess = 'requestSuccess';

GRWWindow.loginFailed = 'loginFailed';
GRWWindow.cookieError = 'cookieError';

GRWWindow.startReaderOpen = 'startReaderOpen';
GRWWindow.readerOpened = 'readerOpened';

GRWWindow.prototype = {
    elements: ['GRW-toolbar-button', 'GRW-toolbar-label', 'GRW-statusbar'],
    subscribeToMenuCommand: function () {
        var doc = this.doc,
            that = this;
        ['GRW-statusbar-menu', 'GRW-toolbar-menu'].forEach(function (elem) {
            var element = doc.getElementById(elem);
            if (element) {
                element.addEventListener('command', function (e) {
                    that.fireEvent('command', e.target);
                }, false);
            }
        });
    },
    generateMenu: function (feeds, labels) {
        Components.utils.import("resource://grwmodules/grwMenu.jsm", scope);
        var doc = this.doc,
            name, menu, conf, element;
        if (this.menus) {
            this.menus.forEach(function (menu) {
                menu.unsubscribeAll();
                menu = null;
            });
            this.menus = null;
        }
        this.menus = [];
        for (name in tooltipElements) {
            if (tooltipElements.hasOwnProperty(name)) {
                element = doc.getElementById(name);
                if (element) {
                    conf = tooltipElements[name];
                    menu = new scope.GrwMenu(this.win, feeds, labels,
                              conf.menuItem, conf.barname);
                    this.menus.push(menu);
                }
            }
        }
    },
    generateTooltip: function (feeds, labels) {
        Components.utils.import("resource://grwmodules/GrwTooltipGrid.jsm", scope);
        var doc = this.doc, name, element, grid, elementContainer;
        for (name in tooltipElements) {
            if (tooltipElements.hasOwnProperty(name)) {
                element = doc.getElementById(name);
                if (element) {
                    element.tooltip = tooltipElements[name].tooltipNewElement;

                    elementContainer = doc.getElementById(tooltipElements[name].tooltipNewElement);
                    while (elementContainer.firstChild) {
                        elementContainer.removeChild(elementContainer.firstChild);
                    }
                    grid = new scope.GrwTooltipGrid(doc, feeds, labels, tooltipElements[name].tooltipNewElement).getGrid();
                    elementContainer.appendChild(grid);
                }
            }
        }
        ['GRW-statusbar-tooltip-new', 'GRW-toolbar-tooltip-new'].forEach(function (elem) {
        });
    },
    resetCounter: function () {
        this.updateCounter(0, 0);
    },
    updateCounter: function (value, maxcount) {
        var counterEnabled = scope.prefs.get.showCounter(),
            showZeroCounter = scope.prefs.get.showZeroCounter(),
            doc = this.doc,
            showval;

        if (scope.prefs.get.maximizeCounter() && maxcount && value > maxcount) {
            showval = maxcount + '+';
        } else {
            showval = value;
        }
        ['GRW-statusbar-label', 'GRW-toolbar-label'].forEach(function (elemId) {
            var elem = doc.getElementById(elemId);
            if (elem) {
                // hide counter
                elem.value = '';
                elem.crop = 'end';
                elem.style.margin = 0;
                elem.style.width = 0;
                elem.collapsed = true;

                if (counterEnabled && (value > 0 || showZeroCounter)) {
                    elem.value = showval;
                    elem.crop = '';
                    elem.style.margin = '';
                    elem.style.width = '';
                    elem.collapsed = false;
                }
            }
        });
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
        ['GRW-toolbar-button', 'GRW-statusbar'].forEach(function (elemId) {
            var elem = that.doc.getElementById(elemId), classes;
            scope.grwlog('updat elem: ' + elemId, elem, status);
            if (elem) {
                classes = elem.getAttribute('class').split(' ').filter(function (cl) {
                    // remove empty classes and the current status class
                    return cl !== '' && cl !== 'on' && cl !== 'off' && cl !== 'error' && cl !== 'load';
                });
                classes.push(status);
                elem.setAttribute('class', classes.join(' '));
            }
        });
    },
    updateTitle: function (type, args) {
        var name, tooltip;
        if (type !== GRWWindow.unreadFound) {
            for (name in tooltipElements) {
                if (tooltipElements.hasOwnProperty(name)) {
                    this.doc.getElementById(name).tooltip = tooltipElements[name][type];
                }
            }
        } else {
            this.generateTooltip(args.unreads, args.labels);
            this.generateMenu(args.unreads, args.labels);
        }
    },
    notify: function (event, args) {
        switch (event) {
        case GRWWindow.requestFailed:
            this.updateIcon('error');
            this.updateTitle(GRWWindow.error);
            break;
        case GRWWindow.requestStarted:
        case GRWWindow.startReaderOpen:
            this.updateIcon('load');
            break;
        case GRWWindow.readerOpened:
            this.updateIcon('off');
            if (scope.prefs.get.resetCounter()) {
                this.resetCounter();
            }
            break;
        case GRWWindow.requestSuccess:
            this.updateIcon('off');
            break;
        case GRWWindow.loginFailed:
            this.updateIcon('error');
            this.updateTitle(GRWWindow.loginFailed);
            break;
        case GRWWindow.cookieError:
            this.updateIcon('error');
            this.updateTitle(GRWWindow.cookieError);
            break;
        case GRWWindow.unreadFound:
            this.updateIcon('on');
            this.updateTitle(GRWWindow.unreadFound, args);
            this.updateCounter(args.elems.unreadSum, args.max);
            // l
            // add/update counter,
            // update tooltip: add grid
            // add menu items
            break;
        case GRWWindow.nonew:
            this.updateIcon('off');
            this.updateTitle(GRWWindow.nonew);
            this.updateCounter(0);
            // remove/update counter,
            // update tooltip: must say no new feed found
            // remove feed menu items
            break;
        case GRWWindow.error:
            this.updateIcon('error');
            this.updateTitle(GRWWindow.error);
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
