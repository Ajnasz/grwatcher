/*global Components: true */
/*jslint es5: true */
var oAuthURL = 'https://accounts.google.com/o/oauth2/auth';
var clientID = '18154408674.apps.googleusercontent.com';
var clientSecret = '7uN4ujGfnbItwS6NbqWgbEJ5';

var oAuthTokenURL = 'https://accounts.google.com/o/oauth2/token';

var scope = {};
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
Components.utils.import("resource://grwmodules/getter.jsm", scope);

/**
 * Generates query params from an array
 * @method generateQueryParam
 * @param {Array} queryParams List of query parameters. Each item must have a
 * name and a value property
 * @return {String} the generated query param
 * @private
 */
function generateQueryParam(queryParams) {
    "use strict";
    return queryParams.map(function (param) {
        if (typeof param.value === 'string') {
            return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value);
        }
    }).join('&');
}

/**
 * Generates urls
 * @method generateRequestURI
 * @param {String} url
 * @param {Array} queryParams
 * @return {String} An url
 */
function generateRequestURI(url, queryParams) {
    "use strict";
    return url + '?' + generateQueryParam(queryParams);
}

/**
 * @class Oauth2Token
 * @param {Object} data
 * @constructor
 */
function Oauth2Token(data) {
    "use strict";

    var expDate, getRefreshToken;

    data = data || {};
    getRefreshToken = function () {
        return scope.prefs.get.oauthRefreshToken();
    };

    expDate = new Date();

    return {
        getAccessToken: function () {
            return data.access_token;
        },
        getTokenType: function () {
            return data.token_type;
        },
        getExpires: function () {
            return data.expires_in;
        },
        isExpired: function () {
            scope.grwlog('is expired: ' + Date.now() > expDate.getTime());
            return !data.expires_in || Date.now() > expDate.getTime();
        },
        getRefreshToken: getRefreshToken,
        setRefreshToken: function (value) {
            return scope.prefs.set.oauthRefreshToken(value);
        },
        setAccessToken: function (val) {
            data.access_token = val;
        },
        updateToken: function (newData) {
            expDate = new Date();
            expDate.setTime(expDate.getTime() + newData.expires_in * 1000);
            data.access_token = newData.access_token;
            data.expires_in = newData.expires_in;
            data.token_type = newData.token_type;
        },
        hasRefreshToken: function () {
            return !!getRefreshToken();
        }
    };
}

/**
 * @class Oauth2
 * @constructor
 */
function Oauth2() {
    "use strict";
    this.accessData = new Oauth2Token();
}
Oauth2.prototype = {
    /**
     * Saves oauth code into pref storage
     * @method saveAuthCode
     * @param {String}
     */
    saveAuthCode: function (value) {
        "use strict";
        return scope.prefs.set.oauthCode(value);
    },

    /**
     * Retreives oauth code from pref storage
     * @method getAuthCode
     * @return {String}
     */
    getAuthCode: function () {
        "use strict";
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        return scope.prefs.get.oauthCode();
    },

    /**
     * @method auth
     * @param {Function} cb Callback
     */
    auth: function (cb) {
        "use strict";

        var that = this,
            Cc,
            win,
            queryParams;

        queryParams = [
            {
                name: 'response_type',
                value: 'code'
            },
            {
                name: 'client_id',
                value: clientID
            },
            {
                name: 'redirect_uri',
                value: 'urn:ietf:wg:oauth:2.0:oob'
            },
            {
                name: 'scope',
                value: ['https://www.google.com/reader/api/0'].join(' ')
            },
            {
                name: 'state',
                value: null
            }
        ];

        Cc = Components.classes;
            // open window to allow access
            // Set most recent window as parent window
        win = Cc["@mozilla.org/embedcomp/window-watcher;1"]
            .getService(Components.interfaces.nsIWindowWatcher)
            .openWindow(
                // parent window
                Cc["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator)
                    .getMostRecentWindow("navigator:browser"),
                // uri
                generateRequestURI(oAuthURL, queryParams),
                // window name
                "GRWatcher Auth request",
                // window params
                "location=yes,status=yes,width=500,height=410",
                null
            );

        Components.utils.import("resource://grwmodules/timer.jsm", scope);

        /**
         * poll the window to get the authorization code
         */
        function poll() {
            scope.later(function () {
                var title = win.document.title;
                if (title.indexOf('Success code=') > -1) {
                    that.accessData.setRefreshToken('');
                    that.saveAuthCode(title.split('code=')[1]);
                    win.close();
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.getFirstToken();
                    scope.grwlog('oauthcode saved');
                } else {
                    scope.grwlog(win.document.title);
                    if (win && !win.closed) {
                        poll();
                    }
                }
            }, 1000);
        }
        poll();
    },

    /**
     * @method getToken
     * @param {Function} cb
     */
    getToken: function (cb) {
        "use strict";
        scope.grwlog('get token: ', typeof this.accessData, this.accessData);
        var that = this, callback;
        callback = function (data) {
            that.setGetterHeaders();
            cb(that.accessData);
        };
        if (!this.accessData.hasRefreshToken()) {
            this.getFirstToken(callback);
        } else if (this.accessData.isExpired()) {
            this.refreshToken(callback);
        } else {
            callback();
        }
    },

    /**
     * Retreives the first token
     * @method getFirstToken
     * @param {Function} cb Callback
     */
    getFirstToken: function (cb) {
        "use strict";

        var that = this,
            url,
            params;

        params = [
            {
                name: 'code',
                value: this.getAuthCode()
            },
            {
                name: 'client_id',
                value: clientID
            },
            {
                name: 'client_secret',
                value: clientSecret
            },
            {
                name: 'redirect_uri',
                value: 'urn:ietf:wg:oauth:2.0:oob'
            },
            {
                name: 'grant_type',
                value: 'authorization_code'
            }
        ];
        scope.grwlog('get first token: ' + oAuthTokenURL, generateQueryParam(params));
        scope.getter.asyncRequest('POST', oAuthTokenURL, {
            onSuccess: function (response) {
                that.onLogin(response);
                if (typeof cb === 'function') {
                    cb(that.accessData);
                }
            },
            onError: function (response) {
                scope.grwlog('on error: ', response.responseText);
                that.fireEvent('loginFailed', response.responseText);
            }
        }, generateQueryParam(params));
    },

    /**
     * @method setGetterHeaders
     */
    setGetterHeaders: function () {
        "use strict";

        scope.getter.setDefaultHeader({
            name: 'Authorization',
            value: this.accessData.getTokenType() + ' ' + this.accessData.getAccessToken()
        });
    },

    /**
     * @method onLogin
     * @param {Object} response
     *      @param {String} response.responseText
     */
    onLogin: function (response) {
        "use strict";
        var jsonResponse = JSON.parse(response.responseText);

        this.accessData.updateToken(jsonResponse);
        if (jsonResponse.refresh_token) {
            this.accessData.setRefreshToken(jsonResponse.refresh_token);
        }
        this.setGetterHeaders();
        this.fireEvent('loginSuccess');
    },

    /**
     * @method refreshToken
     * @param {Function} cb
     */
    refreshToken: function (cb) {
        "use strict";

        var that = this,
            url,
            params;
        params = [
            {
                name: 'client_id',
                value: clientID
            },
            {
                name: 'client_secret',
                value: clientSecret
            },
            {
                name: 'refresh_token',
                value: scope.prefs.get.oauthRefreshToken()
            },
            {
                name: 'grant_type',
                value: 'refresh_token'
            }
        ];
        Components.utils.import("resource://grwmodules/getter.jsm", scope);
        scope.grwlog('refresh token: ' + oAuthTokenURL, generateQueryParam(params));
        scope.getter.asyncRequest('POST', oAuthTokenURL, {
            onSuccess: function (response) {
                that.onLogin(response);
                if (typeof cb === 'function') {
                    cb(that.accessData);
                }
            },
            onError: function (response) {
                that.fireEvent('loginFailed', response.responseText);
                scope.grwlog('on error: ', response.responseText);
            }
        }, generateQueryParam(params));
    }
};

Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(Oauth2, scope.EventProvider);

var oauth = new Oauth2();

var EXPORTED_SYMBOLS = ['Oauth2', 'oauth'];
