/*global Components: true */

var windowName, windowParams, context;
context = {};
windowName = 'Auth request';
windowParams = 'location=yes,status=yes,width=500,height=410';
Components.utils.import("resource://grwmodules/grwlog.jsm", context);

var TOPIC_HTTP_MODIFY_REQUEST = 'http-on-modify-request';
var TOPIC_HTTP_EXAMINE_RESPONSE = 'http-on-examine-response';

function ResponseObserver() {
    "use strict";
    this.callbacks = [];
}
ResponseObserver.prototype = {
    observe: function (subject, topic, data) {
        if (topic === TOPIC_HTTP_EXAMINE_RESPONSE) {
            var channel = subject.QueryInterface(Components.interfaces.nsIHttpChannel),
                location = channel.getResponseHeader('Location'),
                match;

            if (/^urn:ietf:wg:oauth:2\.0:oob/.test(location)) {
                match = location.match(/code=([^&]+)/);
                if (match) {
                    this.callbacks.forEach(function (cb) {
                        cb(match[1]);
                    });
                }
            }
        }
    },
    register: function (cb) {
        "use strict";
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(this, TOPIC_HTTP_EXAMINE_RESPONSE, false);

        this.callbacks.push(cb);
    },
    unregister: function () {
        "use strict";
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                .getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(this, TOPIC_HTTP_EXAMINE_RESPONSE);
    }
};

function Observer() {
    "use strict";

    this.callbacks = [];
}
Observer.prototype = {
    observe: function (subject, topic, data) {
        "use strict";
        var channel, match, obs;
        if (topic === TOPIC_HTTP_MODIFY_REQUEST) {
            channel = subject.QueryInterface(Components.interfaces.nsIHttpChannel);
            if (/https?:\/\/[a-z0-9]+\.feedly\.com\/v3\/auth\/callback\?/.test(subject.URI.spec)) {
                match = subject.URI.spec.match(/code=([^&]+)/);
                obs = new ResponseObserver();
                obs.register(function (code) {
                    this.callbacks.forEach(function (cb) {
                        cb(code);
                    });
                    obs.unregister();
                }.bind(this));
            }
        }
    },
    register: function (cb) {
        "use strict";
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                            .getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(this, TOPIC_HTTP_MODIFY_REQUEST, false);

        this.callbacks.push(cb);
    },
    unregister: function () {
        "use strict";
        var observerService = Components.classes["@mozilla.org/observer-service;1"]
                                .getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(this, TOPIC_HTTP_MODIFY_REQUEST);
    }
};
function Oauth2CodeRequester() {
    "use strict";
    this.observer = null;
}
Oauth2CodeRequester.prototype = {
    createObserver: function () {
        "use strict";
        return new Observer();
    },
    getObserver: function () {
        "use strict";
        if (!this.observer) {
            this.observer = this.createObserver();
        }

        return this.observer;
    },
    unregisterObserver: function () {
        "use strict";

        var observer = this.getObserver();
        observer.unregister();
        this.observer = null;
    },
    registerObserver: function (callback) {
        "use strict";

        var observer = this.getObserver();
        observer.register(callback);
    },
    getParentWindow: function () {
        "use strict";

        var Cc = Components.classes;

        return Cc["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator)
                    .getMostRecentWindow("navigator:browser");
    },
    openAuthWindow: function (authUrl) {
        "use strict";

        var win, Cc, parentWindow;

        Cc = Components.classes;
        parentWindow = this.getParentWindow();
            // open window to allow access
            // Set most recent window as parent window
        win = Cc["@mozilla.org/embedcomp/window-watcher;1"]
            .getService(Components.interfaces.nsIWindowWatcher)
            .openWindow(parentWindow, authUrl, windowName, windowParams, null);

        return win;
    },
    request: function (authUrl, cb) {
        "use strict";

        // open window to allow access
        // Set most recent window as parent window
        var win = this.openAuthWindow(authUrl);

        Components.utils.import("resource://grwmodules/timer.jsm", context);

        function onSuccessCodeFind(code) {
            if (typeof cb === 'function') {
                cb(code);
            }
            win.close();
        }

        function getCodePlacement() {
            if (win) {
                try {
                    if (!win.closed) {
                        return win.document.title;
                    }
                } catch (er) {
                    // may can't access to daed object after window has closed
                }
            }

            return '';
        }

        function extractSuccessCode() {
            return getCodePlacement().split('code=')[1];
        }

        function hasCode() {
            return getCodePlacement().indexOf('Success code=') > -1;
        }

        function isWindowOpened() {
            return win && !win.closed;
        }

        function checkForCode() {
            if (hasCode()) {
                onSuccessCodeFind(extractSuccessCode());
            } else {
                if (isWindowOpened()) {
                    context.later(checkForCode, 1000);
                } else {
                    win = null;
                }
            }
        }

        /**
         * poll the window to get the authorization code
         */
        // checkForCode();
        this.registerObserver(function (code) {
            onSuccessCodeFind(code);
            this.unregisterObserver();
        }.bind(this));

    }
};


var EXPORTED_SYMBOLS = ['Oauth2CodeRequester'];
