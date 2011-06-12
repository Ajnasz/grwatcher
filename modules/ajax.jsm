/*jslint indent:2*/
/*global Components: true, getter: true, GrwCookie: true, generateUri: true, Prefs: true */
var startRequest = 'startRequest',
    requestSuccess = 'requestSuccess',
    requestFailed = 'requestFailed';

Components.utils.import("resource://grwmodules/getter.jsm");

var lastRequest = '';
var request = function (method, uri, callback, postData) {
  var retry = function () {
    getter.asyncRequest(method, uri, callback, postData);
  }, _callback;
  _callback = {
    onSuccess: function (r) {
      lastRequest = '';
      if (typeof callback.onSuccess === 'function') {
        callback.onSuccess.call(this, r);
      }
    },
    onError: function (r) {
      if (r.status === 401 && lastRequest !== 'login') {
        lastRequest = 'login';
        GRW.LoginManager.logIn(retry);
      } else if (r.status === 403 && lastRequest !== 'token' && lastRequest !== 'login') {
        lastRequest = 'token';
        getToken(retry);
      } else {
        lastRequest = '';
      }
      if (typeof callback.onError === 'function') {
        callback.onError.call(callback.onError, r);
      }
    }
  };
  Components.utils.import("resource://grwmodules/Prefs.jsm");
  if (Prefs.get.forceLogin() && lastRequest !== 'login') {
    lastRequest = 'login';
    GRW.LoginManager.logIn(retry);
  } else {
    getter.asyncRequest(method, uri, _callback, postData);
  }
};
var token = null;
var getToken = function (callback) {
  Components.utils.import("resource://grwmodules/generateUri.jsm");
  request('get', generateUri('www.google.com/reader/api/0/token'), {
    onSuccess: function (r) {
      Components.utils.import("resource://grwmodules/GrwCookie.jsm");
      GrwCookie.set('.google.com', 'T', r.responseText);
      token = {
        token: r.responseText,
        date: new Date()
      };
      callback(token);
    },
    onError: function (args) {
      // Components.utils.import("resource://grwmodules/GRWLog.jsm");
      // GRWlog('TOKEN ERROR', args.getAllResponseHeaders(), args.status, args.statusText);
    }
  });
};

let EXPORTED_SYMBOLS = ['request', 'getter', 'getToken'];
