/*jslint sloppy: true*/
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

Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/ClickHandler.jsm", scope);
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
function GRWWindow(win) {
    var that = this;
    this.win = win;
    this.doc = this.win.document;
    this.listenClicks();
    this.subscribeToMenuCommand();
    this.generateMenu(0, 0);
    this.clickHandler = new scope.ClickHandler(this.elements);
    this.clickHandler.on('eventFound', function (args) {
        that.fireEvent(args.shift(), args);
    });
}

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

GRWWindow.iconClasses = {
    load: 'load',
    on: 'on',
    off: 'off',
    error: 'error'
};

GRWWindow.prototype = {
    elements: ['GRW-toolbar-button', 'GRW-toolbar-label', 'GRW-statusbar'],
    menuElemnets: ['GRW-statusbar-menu', 'GRW-toolbar-menu'],
    onMenuCommand: function () {
        var that = this;
        return function (e) {
            // only feed items has url attribute
            if (e.target.getAttribute('url') ||
                        e.target.getAttribute('id') === 'GRW-toolbar-menuitem-openreader' ||
                        e.target.getAttribute('id') === 'GRW-statusbar-menuitem-openreader') {
                // fake event object. We assume that a command would be the
                // same as clicking on a elment with the left mouse button
                var ev = {
                    button: typeof e.button === 'undefined' ? 0 : e.button,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    ctrlKey: e.ctrlKey,
                    target: e.target
                };
                that.clickHandler.handleClick(ev);
            } else {
                e.preventDefault();
                that.fireEvent('command', e);
            }
        };
    },
    subscribeToMenuCommand: function () {
        var doc = this.doc,
            that = this;
        this.menuElemnets.forEach(function (elem) {
            var element = doc.getElementById(elem),
                menuCommand;
            if (element) {
                menuCommand = that.onMenuCommand();
                element.addEventListener('command', menuCommand, false);
                element.addEventListener('click', menuCommand, false);
            }
        });
    },
    unsubscribeMenuCommand: function () {
        var doc = this.doc,
            that = this;
        this.menuElemnets.forEach(function (elem) {
            var element = doc.getElementById(elem),
                menuCommand;
            if (element) {
                menuCommand = that.onMenuCommand();
                element.removeEventListener('command', menuCommand, false);
                element.removeEventListener('click', menuCommand, false);
            }
        });
    },
    generateMenu: function (feeds, labels) {
        Components.utils.import("resource://grwmodules/grwMenu.jsm", scope);
        var doc = this.doc,
            name,
            menu,
            conf,
            element;
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
                    if (scope.prefs.get.showitemsintooltip()) {
                        grid = new scope.GrwTooltipGrid(
                            doc,
                            feeds,
                            labels,
                            tooltipElements[name].tooltipNewElement
                        ).getGrid();
                        elementContainer.appendChild(grid);
                    }
                }
            }
        }
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
    listenClicks: function () {
        var that = this, onDocClick;
        onDocClick = function (e) {
            return that.clickHandler.onClick(e);
        };
        this.doc.addEventListener('click', onDocClick, false);
        this.doc.addEventListener('dblclick', onDocClick, false);
    },
    unlistenClicks: function () {
        var that = this, onDocClick;
        onDocClick = function (e) {
            that.clickHandler.onClick(e);
        };
        this.doc.removeEventListener('click', onDocClick, false);
        this.doc.removeEventListener('dblclick', onDocClick, false);
    },
    updateIcon: function (status) {
        var that = this,
            iconClasses = GRWWindow.iconClasses;


        function iconFilter(cl) {
            // remove empty classes and the current status class
            return cl !== '' &&
                    cl !== iconClasses.on &&
                    cl !== iconClasses.off &&
                    cl !== iconClasses.error &&
                    cl !== iconClasses.load;
        }

        ['GRW-toolbar-button', 'GRW-statusbar'].forEach(function (elemId) {
            var elem = that.doc.getElementById(elemId), classes;
            if (elem) {
                classes = elem.getAttribute('class').split(' ').filter(iconFilter);
                classes.push(status);
                elem.setAttribute('class', classes.join(' '));
            }
        });
    },
    updateTitle: function (type, args) {
        var name, element;
        if (type !== GRWWindow.unreadFound) {
            for (name in tooltipElements) {
                if (tooltipElements.hasOwnProperty(name)) {
                    element = this.doc.getElementById(name);
                    if (element) {
                        element.tooltip = tooltipElements[name][type];
                    }
                }
            }
        } else {
            this.generateTooltip(args.unreads, args.labels);
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
            // add/update counter,
            // update tooltip: add grid
            // add menu items
            this.updateIcon('on');
            this.updateTitle(GRWWindow.unreadFound, args);
            this.generateMenu(args.unreads, args.labels);
            this.updateCounter(args.elems.unreadSum, args.max);
            break;

        case GRWWindow.nonew:
            // remove/update counter,
            // update tooltip: must say no new feed found
            // remove feed menu items
            this.updateIcon('off');
            this.updateTitle(GRWWindow.nonew);
            this.generateMenu(0, 0);
            this.updateCounter(0);
            break;

        case GRWWindow.error:
            // remove counter,
            // update tooltip: must say some error message
            // remove feed menu items
            this.updateIcon('error');
            this.updateTitle(GRWWindow.error);
            break;
        }
    },
    destroy: function () {
        this.unsubscribeMenuCommand();
        this.unlistenClicks();
        this.unsubscribeAll();
        this.doc = null;
        this.win = null;
        this.menus = null;
        delete this.win;
        delete this.doc;
    }
};
scope.augmentProto(GRWWindow, scope.EventProvider);


var EXPORTED_SYMBOLS = ['GRWWindow'];
