/*jshint esnext: true*/
/*global Components: true, */
/*
 * Rules:
 *  By default try to send the request, if it works, have a nice day
 *  on fail:
 *    401 - unauthorized: user must login: send a login request
 *
 *    403 - Forbidden: the token probably expired, so need to get a new one
 *
 * But wait, using oauth we need to do the things a bit differently
 * Ok, I guess if I send the Authorization header, the cookies doesn't matters
 * anymore
 * So the best if I set the cookies right before the first request would be sent
*/
var scope = {};
Components.utils.import("resource://grwmodules/getter.jsm", scope);
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);

const requestTypes = {
    login: 'login',
    token: 'token',
    general: 'general'
};

var lastRequest = requestTypes.general;
var request = function (method, uri, callback, postData) {
    callback = callback || {};
    var retry = function () {
        scope.getter.asyncRequest(method, uri, callback, postData);
    }, _callback;
    _callback = {
        onSuccess: function (r) {
            lastRequest = requestTypes.general;
            if (typeof callback.onSuccess === 'function') {
                callback.onSuccess.call(this, r);
            }
        },
        onError: function (r) {
            Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
            scope.grwlog('reqest error: ' + r.status + ', ' + r.responseText);
            // 401, unauthorized, so need to login, if we didn't tryed yet
            if (r.status === 401 && lastRequest !== requestTypes.login) {
                lastRequest = requestTypes.login;
                scope.loginManager.login(retry);
            } else if (r.status === 403 &&
                    lastRequest !== requestTypes.token &&
                    lastRequest !== requestTypes.login) {
                lastRequest = requestTypes.token;
                scope.loginManager.getToken(retry);
            } else {
                lastRequest = requestTypes.general;
            }
            if (typeof callback.onError === 'function') {
                callback.onError.call(this, r);
            }
        }
    };
    if (scope.prefs.get.haveMultipleAccounts() && lastRequest !== requestTypes.login) {
        lastRequest = requestTypes.login;
        scope.loginManager.login(retry);
    } else {
        scope.getter.asyncRequest(method, uri, _callback, postData);
    }
};

let EXPORTED_SYMBOLS = ['request'];
