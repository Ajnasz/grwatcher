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
     *  listen on GRWWindow events: if user clicks on the icon, the icon and
     *  the counter may need update
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
                    requester.getlist.setUnInitialized();
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
                this.subscribeNotifier();
                this.subscribeMarkAll();
            }
        },
        subscribeMarkAll: function () {
            function onresp() {
                requester.updater();
            }
            markall.on('itemsMarked', onresp);
            markall.on('itemsMarkFailed', onresp);
        },
        subscribeNotifier: function () {
            notifier.on('notifierClicked', function () {
                Components.utils.import("resource://grwmodules/ClickHandler.jsm", scope);
                var mouseCommand = scope.ClickHandler
                    .handleMouseCommand(scope.ClickHandler.fakeEvent());
                readerOpener.open(mouseCommand[1], mouseCommand[2]);
            });
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
        onItemsMatched: function () {
            var unreads = getlist.matchedData.unreads,
                max = getlist.matchedData.max,
                elems = getlist._unreadCount,
                grwWindow = scope.GRWWindow;

            if (elems.unreadSum > 0) {
                this.notify([grwWindow.unreadFound, {
                    unreads: unreads,
                    max: max,
                    elems: elems,
                    labels: getlist.getLabels()
                }]);
                notifier.show(elems.unreadSum, max);
            } else {
                this.notify([grwWindow.nonew]);
            }
        },
        subscribeGetlist: function () {
            var that = this;
            getlist.on('itemsMatchedEvent', function () {
                that.onItemsMatched();
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
        subscribeToWindow: function (grwWin) {
            grwWin.on('updateRequest', function () {
                requester.updater();
            });
            grwWin.on('windowOpenRequest', function (args) {
                readerOpener.open(args[0], args[1]);
            });
            grwWin.on('command', function (e) {
                scope.grwlog('button: ', e.shiftKey);
                if (e.button === 0 || e.button === 1) {
                    var id = e.target.getAttribute('id');
                    switch (id) {
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
                    /*
                    if (e.target.getAttribute('url')) {
                        readerOpener.open(e.target.getAttribute('url'));
                    }
                    */
                }
            });
        },
        add: function (win) {
            this.initRequesters();
            var grwWin = new scope.GRWWindow(win);
            this.subscribeToWindow(grwWin);
            this.windows.push(grwWin);
            if (this.started) {
                this.onItemsMatched();
            }
            this.start();
        },
        remove: function (win) {
            var i,
                wl,
                grwWin;
            for (i = 0, wl = this.windows.length; i < wl; i += 1) {
                if (this.windows[i].win === win) {
                    grwWin = this.windows.splice(i, 1)[0];
                    grwWin.destroy();
                    grwWin = null;
                    break;
                }
            }
        },
        updateGRStates: function () {
            scope.later(function () {
                scope.grwlog('UPDATE GR STATES');
                requester.restart();
            }, 100);
        }
    };

    return new GRWWindows();
}());
var EXPORTED_SYMBOLS = ['grwWindows'];
