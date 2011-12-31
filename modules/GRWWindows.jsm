/*global Components: true*/
var grwWindows = (function () {
    var scope = {},
        getter,
        getlist,
        requester,
        notifier,
        readerOpener,
        markall,
        GRWWindows;

    Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
    Components.utils.import("resource://grwmodules/GRWWindow.jsm", scope);

    Components.utils.import("resource://grwmodules/getter.jsm", scope);
    Components.utils.import("resource://grwmodules/getList.jsm", scope);
    Components.utils.import("resource://grwmodules/Requester.jsm", scope);

    Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);

    Components.utils.import("resource://grwmodules/Notifier.jsm", scope);

    Components.utils.import("resource://grwmodules/OpenReader.jsm", scope);
    Components.utils.import("resource://grwmodules/MarkAllAsRead.jsm", scope);
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
    GRWWindows = function () {
        scope.grwlog('initialize grwwindows');
        this.windows = [];
        Components.utils.import("resource://grwmodules/timer.jsm", scope);
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    };
    GRWWindows.prototype = {
        start: function () {
            if (!this.started) {
                var delay = scope.prefs.get.delayStart(),
                    minDelay = 300;
                delay = delay > minDelay ? delay : minDelay;
                scope.later(function () {
                    // must set to uninitialized
                    requester.getlist._initialized = false;
                    requester.start();
                }, delay);
                this.started = true;
            }
        },
        initRequesters: function () {
            if (!requester) {
                getlist = scope.getList;
                requester = new scope.Requester(getlist);
                notifier = new scope.Notifier();
                readerOpener = new scope.OpenReader();
                markall = new scope.MarkAllAsRead();
                this.subscribeGetter();
                this.subscribeLoginManager();
                this.subscribeGetlist();
                this.subscribeOpener();
            }
        },
        subscribeOpener: function () {
            var that = this,
                grwWindow = scope.GRWWindow;
            readerOpener.on('startOpen', function () {
                that.notify([grwWindow.startReaderOpen]);
            });
            readerOpener.on('readerOpened', function () {
                notifier.showNotification = true;
                that.notify([grwWindow.readerOpened]);
            });
        },
        subscribeGetter: function () {
            var that = this,
                grwWindow = scope.GRWWindow;
            scope.getter.onRequestFailed.subscribe(function () {
                that.notify([grwWindow.requestFailed]);
            });
            scope.getter.onStartRequest.subscribe(function () {
                that.notify([grwWindow.requestStarted]);
            });
            scope.getter.onRequestSuccess.subscribe(function () {
                that.notify([grwWindow.requestSuccess]);
            });
        },
        subscribeGetlist: function () {
            var that = this,
                grwWindow = scope.GRWWindow;
            getlist.on('itemsMatchedEvent', function () {
                var unreads = getlist.matchedData.unreads,
                    max = getlist.matchedData.max,
                    elems = getlist._unreadCount;

                scope.grwlog('items matched: ', elems.unreadSum);
                if (elems.unreadSum > 0) {
                    that.notify([grwWindow.unreadFound, {
                        unreads: unreads,
                        max: max,
                        elems: elems,
                        labels: getlist.getLabels()
                    }]);
                    notifier.show(elems.unreadSum, max);
                } else {
                    that.notify([grwWindow.nonew]);
                }
            });
        },
        subscribeLoginManager: function () {
            var that = this,
                grwWindow = scope.GRWWindow;
            scope.loginManager.on('loginFailed', function () {
                that.notify([grwWindow.loginFailed]);
            });
            scope.loginManager.on('cookieError', function () {
                that.notify([grwWindow.cookieError]);
            });
        },
        notify: function (args) {
            this.windows.forEach(function (win) {
                win.notify.apply(win, args);
            });
        },
        add: function (win, doc) {
            this.initRequesters();
            var grwWin = new scope.GRWWindow(win, doc);
            grwWin.on('iconClick', function () {
                readerOpener.open();
            });
            grwWin.on('iconMiddleClick', function () {
                requester.updater();
            });
            grwWin.on('command', function (target) {
                var id = target.getAttribute('id');
                switch (id) {
                case 'GRW-toolbar-menuitem-openreader':
                case 'GRW-statusbar-menuitem-openreader':
                    readerOpener.open();
                    break;
                case 'GRW-statusbar-menuitem-markallasread':
                case 'GRW-toolbar-menuitem-markallasread':
                    markall.mark();
                    break;
                case 'GRW-statusbar-menuitem-getcounter':
                case 'GRW-toolbar-menuitem-getcounter':
                    requester.updater();
                    break;
                case 'GRW-statusbar-menuitem-openprefs':
                case 'GRW-toolbar-menuitem-openprefs':
                    Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                                      .getService(Components.interfaces.nsIWindowWatcher)
                      .openWindow(null, "chrome://grwatcher/content/grprefs.xul", "GRWatcher",
                                  "chrome,centerscreen", null);
                    break;
                }
                if (target.getAttribute('url')) {
                    readerOpener.open(target.getAttribute('url'));
                }
            });
            this.windows.push(grwWin);
            this.start();
        },
        remove: function (win) {
            var i = 0, wl = this.windows.length, grwWin;
            for (; i < wl; i += 1) {
                if (this.windows[i].win === win) {
                    grwWin = this.windows.splice(i, 1)[0];
                    grwWin.destroy();
                }
            }
        }
    };

    return new GRWWindows();
}());
var EXPORTED_SYMBOLS = ['grwWindows'];
