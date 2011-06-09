Components.utils.import("resource://grwmodules/CustomEvent.jsm");
var getter = {
  _defaultHeaders: {},
  setDefaultHeader: function(h) {
    getter._defaultHeaders[h.name] = h.value;
  },
  getDefaultHeaders: function() {
    return getter._defaultHeaders;
  },
  onRequestSuccess: new CustomEvent('onRequestSuccess'),
  onRequestFailed: new CustomEvent('onRequestFailed'),
  onStartRequest: new CustomEvent('onStartRequest'),
  asyncRequest: function(method, uri, callback, postData) {
    getter.onStartRequest.fire();
    // var req = new XMLHttpRequest();
    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
               .createInstance(Components.interfaces.nsIXMLHttpRequest);
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
    for (let h in defaultHeaders) {
      if(defaultHeaders.hasOwnProperty(h)) {
        req.setRequestHeader(h, defaultHeaders[h]);
      }
    }

    req.onreadystatechange = function(e) {
      if(req.readyState == 4) {
        if(req.status == 200) {
          getter.onRequestSuccess.fire(req);
          if(typeof callback.onSuccess === 'function') {
            callback.onSuccess.call(callback.onSuccess, req);
          }
        } else {
          getter.onRequestFailed.fire(req);
          if(typeof callback.onError === 'function') {
            callback.onError.call(callback.onError, req);
          }
        }
      }
    };
    req.send(postData || '');
    return req;
  }
};
let EXPORTED_SYMBOLS = ['getter'];
