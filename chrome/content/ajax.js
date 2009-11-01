/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license GPL v2
 */
/**
 * AJAX requester class
 * @constructor
 * @class Ajax
 * @namespace GRW
 *
 * @param {Object} pars  object to configure the AJAX request
 *  {String} url the url of the request
 *  {Function} [handler] readyStateChange handler function
 *  {Function} [successHandler] runs, when the request was success
 *  {String} [method] request method (eg.: get, post, head)
 * @param {String} [parameters] if the method should be post, this variable contains the request parameters
 */
GRW.Ajax = function(pars, parameters) {
  if(typeof pars.url == 'undefined') {

    GRW.log('send ajax, url is undefined');
    return false;
  }
  /**
   * @private
   */
  var stChg = function(ob, p) {
    return function() { ob.handler(p); }
  }
  /**
   * @private
   */
  var agent = 'Google Reader Watcher ###VERSION###';

  this.url = pars.url;
  this.pars = typeof pars.pars != 'undefined' ? pars.pars : this.pars;
  this.handler = typeof pars.handler != 'undefined' ? pars.handler : this.handler;
  this.method = typeof pars.method != 'undefined' ? pars.method : 'get';
  this.successHandler = typeof pars.successHandler != 'undefined' ? pars.successHandler : this.successHandler;
  this.onError = typeof pars.onError == 'function' ? pars.onError : null;

GRW.log('39');
  //this.req = new XMLHttpRequest();
  this.req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);  
  // Fix Firefox 3 third party cookie related bug
  // https://bugzilla.mozilla.org/show_bug.cgi?id=437174#c32
  try {
    var ds = Cc["@mozilla.org/webshell;1"].createInstance(Ci.nsIDocShellTreeItem).QueryInterface(Ci.nsIInterfaceRequestor);
  }catch(e) {
    var ds = Cc["@mozilla.org/docshell;1"].createInstance(Ci.nsIDocShellTreeItem).QueryInterface(Ci.nsIInterfaceRequestor);
  }
  ds.itemType = Ci.nsIDocShellTreeItem.typeContent;

  //this.req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

GRW.log('41');
  this.req.open(this.method, this.url, true);
GRW.log('42');
  this.req.channel.loadGroup = ds.getInterface(Ci.nsILoadGroup); // fix ff3
  this.req.channel.loadFlags |= Ci.nsIChannel.LOAD_DOCUMENT_URI; // fix ff3
  this.req.setRequestHeader('User-Agent', agent);
  this.req.setRequestHeader('Accept-Charset','utf-8');
  this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  if(this.method == 'post') {
    this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  }
  this.parameters = typeof parameters != 'undefined' ? parameters : null;
  this.req.onreadystatechange = stChg(this, false);
  this.req.send(this.createParameters());
};
GRW.Ajax.prototype = {
  url: null,
  pars: null,
  req: null,
  method: 'get',
  /**
   * readystatechange handler function
   * @returns the successHandler return value, if the request status was 200
   *   or the errorHandler return value,
   *   or the loadHandler return value while the request is not finished
   */
  handler: function() {
    try {
      if(this.req.readyState == 4) {
        if(typeof this.req.status != 'undefined') {
          if(this.req.status == 200) {
            return this.successHandler(this.req);
          } else {
            return this.errorHandler('status code - ' + this.req.status);
          };
        } else {
          return this.errorHandler('no status code');
        }
      } else {
        return this.loadHandler();
      }
    } catch(Exception) {
      return this.errorHandler('no readyState', Exception);
    }
  },
  /**
   * default success handler function
   * @returns the response text
   * @type String
   */
  successHandler: function() {
    return this.req.responseText;
  },
  /**
   * function to catching the request errors
   * @param {String} msg
   * @param {Exception} Exception
   */
  errorHandler: function(msg, Exception) {
    if(typeof this.onError == 'function') {
      this.onError();
    }
    GRW.StatusBar.switchErrorIcon();
    GRW.StatusBar.hideCounter();
    var msgs = new Array();
    if(this.req.status == 401) {
      // not authorized
      msgs.push('not authorized, third party cookies enabled?');
    }
    msgs.push('Ajax error: ');
    if(msg) {
      msgs.push('msg: ', msg);
    }
    if(Exception) {
      msgs.push('e: ' + Exception, 'm: ' + Exception.message, 'ln: ' + Exception.lineNumber, 'fn: ' + Exception.fileName, 'sr: ' + Exception.source);
    }
    try {
      msgs.push('dsc: ' + this.req.readyState);
    } catch(e) {
      msgs.push(e.message);
    }
    try { // status code
      msgs.push('st: ' + this.req.status);
    } catch(e) {
      msgs.push(e.message);
    }
    try { // status text
      msgs.push('stt: ' + this.req.statusText);
    } catch(e) {
      msgs.push(e.message);
    }
    try {
      GRW.log(this.req.getAllResponseHeaders());
    } catch(e) {
      msgs.push(e.message)
    }
    try {
      GRW.log('responsetext:' + this.req.responseText);
    } catch(e) {
      msgs.push(e.message)
    }
    msgs.push(this.url)
    GRW.log(msgs.join('\n'));
    return false;
  },
  /**
   * runs utnil a request is not completed
   * @type true
   */
  loadHandler: function() {
    GRW.StatusBar.switchLoadIcon();
    return true;
  },
  /**
   * generate the parameters for the request
   * returns the processed parameters or null
   * @type {String,null}
   */
  createParameters: function() {
    var pt = typeof this.parameters;
    if(pt == 'string') {
      return this.parameters;
    } else if(pt == 'undefined') {
      return null;
    }
    var outArray = new Array();
    for(par in this.parameters) {
      outArray.push(par + '=' + encodeURIComponent(this.parameters[par]));
    }
    return outArray.join('&');
  }
};
