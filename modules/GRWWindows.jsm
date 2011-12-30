/*global Components: true*/
var grwWindows = (function () {
    var scope = {},
        getter,
        getlist,
        requester,
        notifier,
        GRWWindows;

    Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
    Components.utils.import("resource://grwmodules/GRWWindow.jsm", scope);

    Components.utils.import("resource://grwmodules/getter.jsm", scope);
    Components.utils.import("resource://grwmodules/getList.jsm", scope);
    Components.utils.import("resource://grwmodules/Requester.jsm", scope);

    Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);

    Components.utils.import("resource://grwmodules/Notifier.jsm", scope);
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
    };
    GRWWindows.prototype = {
        initRequesters: function () {
            if (!requester) {
                getlist = scope.getList;
                requester = new scope.Requester(getlist);
                notifier = new scope.Notifier();
                this.subscribeGetter();
                this.subscribeLoginManager();
                this.subscribeGetlist();
            }
        },
        subscribeGetter: function () {
            var that = this,
                grwWindow = scope.GRWWindow;
            scope.getter.onRequestFailed.subscribe(function () {
                scope.grwlog('on request failed');
                that.notify([grwWindow.requestFailed]);
            });
            scope.getter.onStartRequest.subscribe(function () {
                scope.grwlog('on start request', grwWindow.requestStarted);
                that.notify([grwWindow.requestStarted]);
            });
            scope.getter.onRequestSuccess.subscribe(function () {
                scope.grwlog('on request success');
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
                scope.grwlog('grwwindows iconClick');
                notifier.showNotification = true;
            });
            grwWin.on('iconMiddleClick', function () {
                scope.grwlog('grwwindows iconMiddleClick');
                requester.updater();
            });
            this.windows.push(grwWin);
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
