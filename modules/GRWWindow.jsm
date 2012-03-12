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
    this.win = win;
    this.doc = this.win.document;
    this.listenClicks();
    this.subscribeToMenuCommand();
    this.generateMenu(0, 0);
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
    handleClick: function (e) {
        var browserLike,
            possibilities,
            name,
            getPref,
            how;
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        getPref = scope.prefs.get;

        browserLike = getPref.browserlikeWindowOpen();

        function keyFilter(key) {
            return key.button === e.button &&
                key.shift === e.shiftKey &&
                key.alt === e.altKey &&
                key.ctrl === e.ctrlKey;
        }
        if (browserLike) {
            possibilities = [
                {
                    name: 'newBackgroundTab',
                    keys: [
                        {
                            button: 1,
                            shift: false,
                            ctrl: false,
                            alt: false
                        },
                        {
                            button: 0,
                            ctrl: true,
                            shift: false,
                            alt: false
                        }
                    ]
                },
                {
                    name: 'newForegroundTab',
                    keys: [
                        {
                            button: 1,
                            shift: true,
                            ctrl: false,
                            alt: false
                        },
                        {
                            button: 0,
                            shift: true,
                            ctrl: true,
                            alt: false
                        }
                    ]
                },
                {
                    name: 'currentTab',
                    keys: [
                        {
                            button: 0,
                            shift: false,
                            ctrl: false,
                            alt: false
                        }
                    ]
                },
                {
                    name: 'newWindow',
                    keys: [
                        {
                            button: 0,
                            shift: true,
                            ctrl: false,
                            alt: false
                        }
                    ]
                }
            ];
            name = null;
            possibilities.forEach(function (keyGroup) {
                if (name || keyGroup.keys.some(keyFilter)) {
                    name = name || keyGroup.name;
                }
            });
            if (name) {
                e.preventDefault();
            }
            this.fireEvent('windowOpenRequest', name);
            Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
            scope.grwlog('open name', name, 'btn: ' + e.button, ' shift' +
                         e.shiftKey, ' alt: ' + e.altKey, ' ctrl: ' +
                         e.ctrlKey);
        } else {
            name = '';
            switch (e.button) {
            case 0:
                name = 'windowOpenRequest';
                if (getPref.openInNewTab()) {
                    if (getPref.activateOpenedTab()) {
                        how = 'newForegroundTab';
                    } else {
                        how = 'newBackgroundTab';
                    }
                } else {
                    how = 'currentTab';
                }
                break;
            case 1:
                name = 'updateRequest';
                break;
            }
            if (name !== '') {
                if (customDefs[scope.prefs.get.leftClickOpen()] === e.type) {
                    this.fireEvent(name, how);
                }
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
        var that = this,
            iconClasses = GRWWindow.iconClasses;
        ['GRW-toolbar-button', 'GRW-statusbar'].forEach(function (elemId) {
            var elem = that.doc.getElementById(elemId), classes;
            if (elem) {
                classes = elem.getAttribute('class').split(' ').filter(function (cl) {
                    // remove empty classes and the current status class
                    return cl !== '' &&
                            cl !== iconClasses.on &&
                            cl !== iconClasses.off &&
                            cl !== iconClasses.error &&
                            cl !== iconClasses.load;
                });
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
