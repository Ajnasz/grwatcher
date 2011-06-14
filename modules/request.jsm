/*jslint indent:2*/
/*global Components: true, getter: true, Prefs: true, getToken: true, loginManager: true */
Components.utils.import("resource://grwmodules/getter.jsm");

var requestTypes = {
  login: 'login',
  token: 'token',
  general: 'general'
};

var lastRequest = requestTypes.general;
var request = function (method, uri, callback, postData) {
  callback = callback || {};
  var retry = function () {
    getter.asyncRequest(method, uri, callback, postData);
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
        Components.utils.import("resource://grwmodules/loginmanager.jsm");
        loginManager.logIn(retry);
      } else if (r.status === 403 &&
          lastRequest !== requestTypes.token &&
          lastRequest !== requestTypes.login) {

        lastRequest = requestTypes.token;
        Components.utils.import("resource://grwmodules/getToken.jsm");
        getToken(retry);
      } else {
        lastRequest = requestTypes.general;
      }
      if (typeof callback.onError === 'function') {
        callback.onError.call(this, r);
      }
    }
  };
  Components.utils.import("resource://grwmodules/Prefs.jsm");
  if (Prefs.get.forceLogin() && lastRequest !== requestTypes.login) {
    lastRequest = requestTypes.login;
    Components.utils.import("resource://grwmodules/loginmanager.jsm");
    loginManager.logIn(retry);
  } else {
    getter.asyncRequest(method, uri, _callback, postData);
  }
};

let EXPORTED_SYMBOLS = ['request'];
