(function(){
  var startRequest = 'startRequest',
      requestSuccess = 'requestSuccess',
      requestFailed = 'requestFailed';

  Components.utils.import("resource://grwmodules/getter.jsm");
  Components.utils.import("resource://grwmodules/generateUri.jsm");

  var _getToken = function(callback) {
    request('get', generateUri('www.google.com/reader/api/0/token'), {
      onSuccess: function(r){
        Components.utils.import("resource://grwmodules/GrwCookie.jsm");
        GrwCookie.set('.google.com', 'T', r.responseText);
        GRW.token = {
          token: r.responseText,
          date: new Date()
        }
        callback()
      },
      onError: function(args) {
        Components.utils.import("resource://grwmodules/GRWLog.jsm");
        GRWlog('TOKEN ERROR', args.getAllResponseHeaders(), args.status, args.statusText);
      }
    });
  };
  var lastRequest = '';
  var request = function(method, uri, callback, postData) {
    var retry = function() {
      getter.asyncRequest(method, uri, callback, postData);
    };
    var _callback = {
      onSuccess: function(r) {
        lastRequest = '';
        if(GRW.lang.isFunction(callback.onSuccess)) {
          callback.onSuccess.call(this, r);
        }
      },
      onError: function(r) {
        if(r.status == 401 && lastRequest != 'login') {
          lastRequest = 'login';
          GRW.LoginManager.logIn(retry);
        } else if (r.status == 403 && lastRequest != 'token' && lastRequest != 'login') {
          lastRequest = 'token';
          _getToken(retry);
        } else {
          lastRequest = '';
        }
        if(GRW.lang.isFunction(callback.onError)) {
          callback.onError.call(callback.onError, r);
        }
      },
    }
    Components.utils.import("resource://grwmodules/Prefs.jsm");
    if(Prefs.get.forceLogin() && lastRequest != 'login') {
      lastRequest = 'login';
      GRW.LoginManager.logIn(retry);
    } else {
      getter.asyncRequest(method, uri, _callback, postData);
    }
  };
  GRW.module('request', request);
  GRW.module('getter', getter);
  GRW.module('getToken', _getToken);
})();
