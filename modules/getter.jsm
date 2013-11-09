/*jslint indent:2*/
/*global Components: true*/
var scope = {};
Components.utils.import("resource://grwmodules/CustomEvent.jsm", scope);
var defaultHeaders = {};
var getter = {
  setDefaultHeader: function (h) {
    defaultHeaders[h.name] = h.value;
  },
  unsetDefaultHeader: function (h) {
    delete defaultHeaders[h];
  },
  getDefaultHeaders: function () {
    return defaultHeaders;
  },
  onRequestSuccess: new scope.CustomEvent('onRequestSuccess'),
  onRequestFailed: new scope.CustomEvent('onRequestFailed'),
  onStartRequest: new scope.CustomEvent('onStartRequest'),
  asyncRequest: function (method, uri, callback, postData, headers) {
    getter.onStartRequest.fire();
    // var req = new XMLHttpRequest();
    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
               .createInstance(Components.interfaces.nsIXMLHttpRequest),
      agent = 'Google Reader Watcher ___VERSION___',
      defaultHeaders,
      h;
    if (!req) {
      getter.onRequestFailed.fire();
      return false;
    }

    headers = headers || {};

    if (method.toUpperCase() === 'GET') {
      if (postData) {
        uri += (uri.indexOf('?') === -1 ? '?' : '&') + postData;
        postData = null;
      }
    }

    req.open(method, uri, true);

    req.setRequestHeader('Accept-Charset', 'utf-8');
    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    if (method.toUpperCase() === 'POST' && !headers['Content-Type']) {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    req.setRequestHeader('User-Agent', agent);

    defaultHeaders = getter.getDefaultHeaders();
    for (h in defaultHeaders) {
      if (defaultHeaders.hasOwnProperty(h)) {
        req.setRequestHeader(h, defaultHeaders[h]);
      }
    }
    h = null;

    req.onreadystatechange = function (e) {
      if (req.readyState === 4) {
        if (req.status === 200) {
          getter.onRequestSuccess.fire(req);
          if (typeof callback.onSuccess === 'function') {
            callback.onSuccess.call(callback.onSuccess, req);
          }
        } else {
          getter.onRequestFailed.fire(req);
          if (typeof callback.onError === 'function') {
            callback.onError.call(callback.onError, req);
          }
        }
      }
    };
    req.send(postData || '');
    return req;
  }
};
var EXPORTED_SYMBOLS = ['getter'];
