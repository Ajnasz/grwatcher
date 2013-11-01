/*global Components: true */
/*jslint es5: true */

var clientConfigs, context, clientConfig;

clientConfigs = {
    google: {
        clientID: '18154408674.apps.googleusercontent.com',
        clientSecret: '7uN4ujGfnbItwS6NbqWgbEJ5',
        oAuthURL: 'https://accounts.google.com/o/oauth2/auth',
        oAuthTokenURL: 'https://accounts.google.com/o/oauth2/token',
        scope: 'https://www.google.com/reader/api/0',
        windowName: 'GRWatcher Auth request',
        windowParams: 'location=yes,status=yes,width=500,height=410',
        redirectUri: 'urn:ietf:wg:oauth:2.0:oob'
    },
    feedlySandbox: {
        clientID: 'sandbox',
        clientSecret: 'Z5ZSFRASVWCV3EFATRUY', // expires 12/1/2013
        oAuthURL: 'https://sandbox.feedly.com/v3/auth/auth',
        oAuthTokenURL: 'http://sandbox.feedly.com/v3/auth/token',
        scope: 'https://cloud.feedly.com/subscriptions',
        windowName: 'Feedly Auth request',
        windowParams: 'location=yes,status=yes,width=500,height=410',
        redirectUri: 'http://localhost'
        // redirectUri: 'urn:ietf:wg:oauth:2.0:oob'
    }
};

clientConfig = clientConfigs.feedlySandbox;

context = {};
// Components.utils.import("resource://grwmodules/grwlog.jsm", context);
Components.utils.import("resource://grwmodules/prefs.jsm", context);
Components.utils.import("resource://grwmodules/getter.jsm", context);


function makeRequeset(args) {
    "use strict";

    context.getter.asyncRequest(
        args.method,
        args.url,
        {
            onSuccess: args.success,
            onError: args.error
        },
        args.data
    );
}

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
 * @class Oauth2
 * @constructor
 */
function Oauth2() {
    "use strict";

    Components.utils.import("resource://grwmodules/Oauth2Token.jsm", context);
    this.accessData = new context.Oauth2Token();
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

    getAuthQueryParams: function () {
        "use strict";

        return [
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
    },

    getAuthUrl: function () {
        "use strict";
        return generateRequestURI(clientConfig.oAuthURL, this.getAuthQueryParams());
    },

    /**
     * @method auth
     * @param {Function} cb Callback
     */
    auth: function (cb) {
        "use strict";

        Components.utils.import("resource://grwmodules/Oauth2CodeRequester.jsm", context);
        var codeRequester = new context.Oauth2CodeRequester();
        codeRequester.request(this.getAuthUrl(), function (code) {
            this.accessData.setRefreshToken('');
            this.saveAuthCode(code);
            this.getFirstToken();
        }.bind(this));

    },

    /**
     * @method getToken
     * @param {Function} cb
     */
    getToken: function (cb) {
        "use strict";
        var that = this;

        function callback(data) {
            that.setGetterHeaders();
            cb(that.accessData);
        }

        if (!this.accessData.hasRefreshToken()) {
            this.getFirstToken(callback);
        } else if (this.accessData.isExpired()) {
            this.refreshToken(callback);
        } else {
            callback();
        }
    },

    getFirstTokenQueryParams: function () {
        "use strict";
        return [
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
    },

    onFirstTokenSuccess: function (cb) {
        "use strict";
        return function (response) {
            Components.utils.import("resource://grwmodules/JSON.jsm", context);
            this.onLogin(context.JSON.parse(response.responseText));
            if (typeof cb === 'function') {
                cb(this.accessData);
            }
        }.bind(this);
    },

    onFirstTokenError: function (response) {
        "use strict";
        this.fireEvent('loginFailed', response.responseText);
    },

    /**
     * Retreives the first token
     * @method getFirstToken
     * @param {Function} cb Callback
     */
    getFirstToken: function (cb) {
        "use strict";

        makeRequeset({
            method: 'POST',
            url: clientConfig.oAuthTokenURL,
            data: generateQueryParam(this.getFirstTokenQueryParams()),
            success: this.onFirstTokenSuccess(cb),
            error: this.onFirstTokenError.bind(this)
        });
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
    onLogin: function (jsonResponse) {
        "use strict";

        this.accessData.updateToken(jsonResponse);
        if (jsonResponse.refresh_token) {
            this.accessData.setRefreshToken(jsonResponse.refresh_token);
        }
        this.setGetterHeaders();
        this.fireEvent('loginSuccess');
    },

    getRefreshTokenQueryParams: function () {
        "use strict";
        return [
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
    },

    onRefershTokenSuccess: function (cb) {
        "use strict";

        return function (response) {
            this.onLogin(JSON.parse(response.responseText));
            if (typeof cb === 'function') {
                cb(this.accessData);
            }
        }.bind(this);
    },

    onRefreshTokenError: function (response) {
        "use strict";
        this.fireEvent('loginFailed', response.responseText);
    },

    /**
     * @method refreshToken
     * @param {Function} cb
     */
    refreshToken: function (cb) {
        "use strict";

        makeRequeset({
            method: 'POST',
            url: clientConfig.oAuthTokenURL,
            data: generateQueryParam(this.getRefreshTokenQueryParams()),
            success: this.onRefershTokenSuccess(cb),
            error: this.onRefershTokenSuccess.bind(this)
        });
    }
};

Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);
context.augmentProto(Oauth2, context.EventProvider);

var oauth = new Oauth2();

var EXPORTED_SYMBOLS = ['Oauth2', 'oauth'];
