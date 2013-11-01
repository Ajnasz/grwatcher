/*global Components: true */
var context = {};
Components.utils.import("resource://grwmodules/prefs.jsm", context);

/**
 * @class Oauth2Token
 * @param {Object} data
 * @constructor
 */
function Oauth2Token(data) {
    "use strict";

    var expDate;

    data = data || {};

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
            return !data.expires_in || Date.now() > expDate.getTime();
        },
        getRefreshToken: function () {
            return context.prefs.get.oauthRefreshToken();
        },
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
            data.token_type = 'OAuth';// || newData.token_type;
        },
        hasRefreshToken: function () {
            return !!this.getRefreshToken();
        }
    };
}

var EXPORTED_SYMBOLS = ['Oauth2Token'];
