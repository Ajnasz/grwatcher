(function(){
  var startRequest = 'startRequest',
      requestSuccess = 'requestSuccess',
      requestFailed = 'requestFailed';

  var getter = {
    _defaultHeaders: {},
    setDefaultHeader: function(h) {
      getter._defaultHeaders[h.name] = h.value;
    },
    getDefaultHeaders: function() {
      return getter._defaultHeaders;
    },
    onRequestSuccess: new GRW.CustomEvent('onRequestSuccess'),
    onRequestFailed: new GRW.CustomEvent('onRequestFailed'),
    onStartRequest: new GRW.CustomEvent('onStartRequest'),
    asyncRequest: function(method, uri, callback, postData) {
      getter.onStartRequest.fire();
      var req = new XMLHttpRequest();
      var agent = 'Google Reader Watcher ###VERSION###';
      if(!req) {
        getter.onRequestFailed.fire();
        return false;
      }

      if(method.toUpperCase() == 'GET') {
        if(postData) {
          uri += (uri.indexOf('?') == -1 ? '?' : '&') + postData
          postData = null;
        }
      }

      req.open(method, uri, true);

      req.setRequestHeader('Accept-Charset','utf-8');
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if(method.toUpperCase() == 'POST') {
        req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      }
      req.setRequestHeader('User-Agent', agent);

      var defaultHeaders = getter.getDefaultHeaders();
      for (var h in defaultHeaders) {
        if(defaultHeaders.hasOwnProperty(h)) {
          req.setRequestHeader(h, defaultHeaders[h]);
        }
      }

      req.onreadystatechange = function(e) {
        if(req.readyState == 4) {
          if(req.status == 200) {
            getter.onRequestSuccess.fire(req);
            if(GRW.lang.isFunction(callback.onSuccess)) {
              callback.onSuccess.call(callback.onSuccess, req);
            }
          } else {
            getter.onRequestFailed.fire(req);
            if(GRW.lang.isFunction(callback.onError)) {
              callback.onError.call(callback.onError, req);
            }
          }
        }
      };
      req.send(postData || '');
      return req;
    }
  };

  var _getToken = function(callback) {
    request('get', GRW.States.conntype + '://www.google.com/reader/api/0/token', {
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
    var _callback = {
      onSuccess: callback.onSuccess,
      onError: function(r) {
        var retry = function() {
          getter.asyncRequest(method, uri, callback, postData);
        };
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
    getter.asyncRequest(method, uri, _callback, postData);
  };
  GRW.module('request', request);
  GRW.module('getter', getter);
  GRW.module('getToken', _getToken);
})();
