var oAuthURL = 'https://accounts.google.com/o/oauth2/auth';
var clientID = '18154408674.apps.googleusercontent.com';
var clientSecret = '7uN4ujGfnbItwS6NbqWgbEJ5';

var oAuthTokenURL = 'https://accounts.google.com/o/oauth2/token';

var scope = {};
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/prefs.jsm", scope);

var generateQueryParam = function (queryParams) {
    return queryParams.map(function (param) {
        if (typeof param.value === 'string') {
            return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value);
        }
    }).join('&');
};

var generateRequestURI = function (url, queryParams) {
    return url + '?' + generateQueryParam(queryParams);
};

var Oauth2Token = function (data) {
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
};

var Oauth2 = function Oauth2() {
    this._currentToken = '';
    this._accessData = new Oauth2Token();
};
Oauth2.prototype = {
    saveAuthCode: function (value) {
        return scope.prefs.set.oauthCode(value);
    },
    getAuthCode: function () {
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        return scope.prefs.get.oauthCode();
    },
    auth: function () {
        var that = this,
            poll,
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

        var win = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                          .getService(Components.interfaces.nsIWindowWatcher)
          .openWindow(null, generateRequestURI(oAuthURL, queryParams), "GRWatcher Auth request",
                      "location=yes,status=yes,width=500,height=410", null);

        Components.utils.import("resource://grwmodules/timer.jsm", scope);
        /**
         * poll the window to get the authorization code
         */
        poll = function () {
            scope.later(function () {
                var title = win.document.title;
                if (title.indexOf('Success code=') > -1) {
                    that._accessData.setRefreshToken('');
                    that.saveAuthCode(title.split('code=')[1]);
                    win.close();
                    scope.grwlog('oauthcode saved');
                } else {
                    scope.grwlog(win.document.title);
                    if (win && !win.closed) {
                        poll();
                    }
                }
            }, 1000);
        };
        poll();
    },
    getToken: function (cb) {
        scope.grwlog('get token: ', typeof this._accessData, this._accessData);
        if (!this._accessData.hasRefreshToken()) {
            this.getFirstToken(cb);
        } else if (this._accessData.isExpired()) {
            this.refreshToken(cb);
        } else {
            cb(this._accessData);
        }
    },
    getFirstToken: function (cb) {
        var that = this,
            url, params;
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
        Components.utils.import("resource://grwmodules/getter.jsm", scope);
        scope.grwlog('get first token: ' + oAuthTokenURL, generateQueryParam(params));
        scope.getter.asyncRequest('POST', oAuthTokenURL, {
            onSuccess: function (response) {
                var jsonResponse = JSON.parse(response.responseText);
                that._accessData.updateToken(jsonResponse);
                that._accessData.setRefreshToken(jsonResponse.refresh_token);
                cb(that._accessData);
            },
            onError: function (response) {
                scope.grwlog('on error: ', response.responseText);
            }
        }, generateQueryParam(params));
    },
    setToken: function (data) {
        if (!this._accessData) {
            this._accessData = new Oauth2Token(data);
        } else {
        }
    },
    refreshToken: function (cb) {
        var that = this,
            url, params;
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
                var jsonResponse = JSON.parse(response.responseText);
                scope.grwlog(response.responseText);
                that._accessData.updateToken(jsonResponse);
                cb(that._accessData);
            },
            onError: function (response) {
                scope.grwlog('on error: ', response.responseText);
            }
        }, generateQueryParam(params));
    }
};

var oauth = new Oauth2();

var EXPORTED_SYMBOLS = ['Oauth2', 'oauth'];
