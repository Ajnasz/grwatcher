/*global Components: true */

var windowName, windowParams, context;
context = {};
windowName = 'Auth request';
windowParams = 'location=yes,status=yes,width=500,height=410';
function Oauth2CodeRequester() {
    "use strict";
}
Oauth2CodeRequester.prototype = {
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
            win.close();
            if (typeof cb === 'function') {
                cb(code);
            }
        }

        function getCodePlacement() {
            return win.document.title;
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
                }
            }
        }

        /**
         * poll the window to get the authorization code
         */
        checkForCode();
    }
};


var EXPORTED_SYMBOLS = ['Oauth2CodeRequester'];
