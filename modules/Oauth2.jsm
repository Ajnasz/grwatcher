/*global Components: true */
/*jslint es5: true */
var clientConfigs = {
    google: {
        clientID: '18154408674.apps.googleusercontent.com',
        clientSecret: '7uN4ujGfnbItwS6NbqWgbEJ5',
        oAuthURL: 'https://accounts.google.com/o/oauth2/auth',
        oAuthTokenURL: 'https://accounts.google.com/o/oauth2/token',
        scope: 'https://www.google.com/reader/api/0',
        redirectUri: 'urn:ietf:wg:oauth:2.0:oob'
    },
    feedlySandbox: {
        clientID: 'sandbox',
        clientSecret: 'Z5ZSFRASVWCV3EFATRUY', // expires 12/1/2013
        oAuthURL: 'https://sandbox.feedly.com/v3/auth/auth',
        oAuthTokenURL: 'http://sandbox.feedly.com/v3/auth/token',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'http://localhost'
        // redirectUri: 'urn:ietf:wg:oauth:2.0:oob'
    }
};

var clientConfig = clientConfigs.feedlySandbox;



var context = {};
Components.utils.import("resource://grwmodules/grwlog.jsm", context);
Components.utils.import("resource://grwmodules/prefs.jsm", context);
Components.utils.import("resource://grwmodules/getter.jsm", context);

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
        return null;
    }).filter(function (i) { return i && i.trim() !== ''; }).join('&');
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
        return context.prefs.get.oauthRefreshToken();
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
            context.grwlog('is expired: ' + Date.now() > expDate.getTime());
            return !data.expires_in || Date.now() > expDate.getTime();
        },
        getRefreshToken: getRefreshToken,
        setRefreshToken: function (value) {
            return context.prefs.set.oauthRefreshToken(value);
        },
        setAccessToken: function (val) {
            data.access_token = val;
        },
        updateToken: function (newData) {
            expDate = new Date();
            expDate.setTime(expDate.getTime() + newData.expires_in * 1000);
            data.access_token = newData.access_token;
            data.expires_in = newData.expires_in;
            data.token_type = 'OAuth' || newData.token_type;
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
        return context.prefs.set.oauthCode(value);
    },

    /**
     * Retreives oauth code from pref storage
     * @method getAuthCode
     * @return {String}
     */
    getAuthCode: function () {
        "use strict";
        Components.utils.import("resource://grwmodules/prefs.jsm", context);
        return context.prefs.get.oauthCode();
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
                value: clientConfig.clientID
            },
            {
                name: 'redirect_uri',
                value: clientConfig.redirectUri
            },
            {
                name: 'scope',
                value: clientConfig.scope
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
                generateRequestURI(clientConfig.oAuthURL, queryParams),
                // window name
                "GRWatcher Auth request",
                // window params
                "location=yes,status=yes,width=500,height=410",
                null
            );

        Components.utils.import("resource://grwmodules/timer.jsm", context);

        /**
         * poll the window to get the authorization code
         */
        function poll() {
            context.later(function () {
                var title = win.document.title;
                context.grwlog(win.document.location.href);
                if (title.indexOf('Success code=') > -1) {
                    that.accessData.setRefreshToken('');
                    that.saveAuthCode(title.split('code=')[1]);
                    win.close();
                    if (typeof cb === 'function') {
                        cb();
                    }
                    that.getFirstToken();
                    context.grwlog('oauthcode saved');
                } else {
                    context.grwlog(win.document.title);
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
        context.grwlog('get token: ', typeof this.accessData, this.accessData);
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
                value: clientConfig.clientID
            },
            {
                name: 'client_secret',
                value: clientConfig.clientSecret
            },
            {
                name: 'redirect_uri',
                value: clientConfig.redirectUri
            },
            {
                name: 'grant_type',
                value: 'authorization_code'
            }
        ];
        context.grwlog('get first token: ' + clientConfig.oAuthTokenURL, generateQueryParam(params));
        context.getter.asyncRequest('POST', clientConfig.oAuthTokenURL, {
            onSuccess: function (response) {
                that.onLogin(response);
                if (typeof cb === 'function') {
                    cb(that.accessData);
                }
            },
            onError: function (response) {
                context.grwlog('on error: ', response.responseText);
                that.fireEvent('loginFailed', response.responseText);
            }
        }, generateQueryParam(params));
    },

    /**
     * @method setGetterHeaders
     */
    setGetterHeaders: function () {
        "use strict";

        context.getter.setDefaultHeader({
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
                value: clientConfig.clientID
            },
            {
                name: 'client_secret',
                value: clientConfig.clientSecret
            },
            {
                name: 'refresh_token',
                value: context.prefs.get.oauthRefreshToken()
            },
            {
                name: 'grant_type',
                value: 'refresh_token'
            }
        ];
        Components.utils.import("resource://grwmodules/getter.jsm", context);
        context.grwlog('refresh token: ' + clientConfig.oAuthTokenURL, generateQueryParam(params));
        context.getter.asyncRequest('POST', clientConfig.oAuthTokenURL, {
            onSuccess: function (response) {
                that.onLogin(response);
                if (typeof cb === 'function') {
                    cb(that.accessData);
                }
            },
            onError: function (response) {
                that.fireEvent('loginFailed', response.responseText);
                context.grwlog('on error: ', response.responseText);
            }
        }, generateQueryParam(params));
    }
};

Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);
context.augmentProto(Oauth2, context.EventProvider);

var oauth = new Oauth2();

var EXPORTED_SYMBOLS = ['Oauth2', 'oauth'];
