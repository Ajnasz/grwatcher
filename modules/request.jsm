/*jslint indent:2*/
var scope = {};
/*global Components: true, */
Components.utils.import("resource://grwmodules/getter.jsm", scope);

var requestTypes = {
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
      if (r.status === 401 && lastRequest !== requestTypes.login) {
        lastRequest = requestTypes.login;
        Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);
        scope.loginManager.logIn(retry);
      } else if (r.status === 403 &&
          lastRequest !== requestTypes.token &&
          lastRequest !== requestTypes.login) {

        lastRequest = requestTypes.token;
        Components.utils.import("resource://grwmodules/getToken.jsm", scope);
        scope.getToken(retry);
      } else {
        lastRequest = requestTypes.general;
      }
      if (typeof callback.onError === 'function') {
        callback.onError.call(this, r);
      }
    }
  };
  Components.utils.import("resource://grwmodules/prefs.jsm", scope);
  if (scope.prefs.get.forceLogin() && lastRequest !== requestTypes.login) {
    lastRequest = requestTypes.login;
    Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);
    scope.loginManager.logIn(retry);
  } else {
    scope.getter.asyncRequest(method, uri, _callback, postData);
  }
};

let EXPORTED_SYMBOLS = ['request'];
