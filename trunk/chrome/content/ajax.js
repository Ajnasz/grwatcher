/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license GPL v2
 */
/**
 * AJAX requester class
 * @constructor
 * @class Ajax
 *
 * @param {Object} pars  object to configure the AJAX request
 *  {String} url the url of the request
 *  {Function} [handler] readyStateChange handler function
 *  {Function} [successHandler] runs, when the request was success
 *  {String} [method] request method (eg.: get, post, head)
 * @param {String} [parameters] if the method should be post, this variable contains the request parameters
 */
var Ajax = function(pars, parameters) {
  if(typeof pars.url == 'undefined') {
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
  var agent = 'Google Reader Watcher 0.0.12.1';

  this.url = pars.url;
  this.pars = typeof pars.pars != 'undefined' ? pars.pars : this.pars;
  this.handler = typeof pars.handler != 'undefined' ? pars.handler : this.handler;
  this.method = typeof pars.method != 'undefined' ? pars.method : 'get';
  this.successHandler = typeof pars.successHandler != 'undefined' ? pars.successHandler : this.successHandler;

  this.req = new XMLHttpRequest();
  this.req.open(this.method, this.url, true);
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
Ajax.prototype = {
  url: null,
  pars: null,
  req: null,
  method: 'get',
  /**
   * readystatechange handler function
   * @param 
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
    GRW_StatusBar.switchErrorIcon();
    GRW_StatusBar.hideCounter();
    var msgs = new Array();
    if(this.req.status == 401) {
      // not authorized
    }
    msgs.push('Ajax error: ' + msg, 'e: ' + Exception, 'm: ' + Exception.message, 'ln: ' + Exception.lineNumber, 'fn: ' + Exception.fileName, 'sr: ' + Exception.source);
    try {
      msgs.push('dsc: ' + this.req.readyState);
    } catch(e) {
      msgs.push(e.message);
    }
    try {
      msgs.push('st: ' + this.req.status);
    } catch(e) {
      msgs.push(e.message);
    }
    try {
      msgs.push('stt: ' + this.req.statusText);
    } catch(e) {
      msgs.push(e.message);
    }
    try {
      GRW_LOG(this.req.getAllResponseHeaders());
    } catch(e) {
      msgs.push(e.message)
    }
    msgs.push(this.url)
    GRW_LOG(msgs.join('\n'));
    return false;
  },
  /**
   * runs utnil a request is not completed
   * @type true
   */
  loadHandler: function() {
    GRW_StatusBar.switchLoadIcon();
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
