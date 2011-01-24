Components.utils.import("resource://grwmodules/CustomEvent.jsm");
var Getter = {
  _defaultHeaders: {},
  setDefaultHeader: function(h) {
    Getter._defaultHeaders[h.name] = h.value;
  },
  getDefaultHeaders: function() {
    return Getter._defaultHeaders;
  },
  onRequestSuccess: new CustomEvent('onRequestSuccess'),
  onRequestFailed: new CustomEvent('onRequestFailed'),
  onStartRequest: new CustomEvent('onStartRequest'),
  asyncRequest: function(method, uri, callback, postData) {
    Getter.onStartRequest.fire();
    // var req = new XMLHttpRequest();
    var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
               .createInstance(Components.interfaces.nsIXMLHttpRequest);
    var agent = 'Google Reader Watcher ###VERSION###';
    if(!req) {
      Getter.onRequestFailed.fire();
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

    var defaultHeaders = Getter.getDefaultHeaders();
    for (let h in defaultHeaders) {
      if(defaultHeaders.hasOwnProperty(h)) {
        req.setRequestHeader(h, defaultHeaders[h]);
      }
    }

    req.onreadystatechange = function(e) {
      if(req.readyState == 4) {
        if(req.status == 200) {
          Getter.onRequestSuccess.fire(req);
          if(typeof callback.onSuccess === 'function') {
            callback.onSuccess.call(callback.onSuccess, req);
          }
        } else {
          Getter.onRequestFailed.fire(req);
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
let EXPORTED_SYMBOLS = ['Getter'];
