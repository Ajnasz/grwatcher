(function(){
  var startRequest = 'startRequest',
      requestSuccess = 'requestSuccess',
      requestFailed = 'requestFailed';

  Components.utils.import("resource://grwmodules/Getter.jsm");
  Components.utils.import("resource://grwmodules/GRWUri.jsm");

  var _getToken = function(callback) {
    request('get', GRWUri('www.google.com/reader/api/0/token'), {
      onSuccess: function(r){
        // GRW.setCookie('T', r.responseText);
        GRW.Cookie.set('.google.com', 'T', r.responseText);
        GRW.token = {
          token: r.responseText,
          date: new Date()
        }
        callback()
      },
      onError: function(args) {
        GRW.log('TOKEN ERROR', args.getAllResponseHeaders(), args.status, args.statusText);
      }
    });
  };
  var lastRequest = '';
  var request = function(method, uri, callback, postData) {
    var retry = function() {
      Getter.asyncRequest(method, uri, callback, postData);
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
    if(GRW.Prefs.get.forceLogin() && lastRequest != 'login') {
      lastRequest = 'login';
      GRW.LoginManager.logIn(retry);
    } else {
      Getter.asyncRequest(method, uri, _callback, postData);
    }
  };
  GRW.module('request', request);
  GRW.module('getter', Getter);
  GRW.module('getToken', _getToken);
})();
