(function(){
  var onStartRequest = 'onStartRequest',
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
  grwajax = function(pars, parameters) {
    this._init.apply(this, arguments);
  };
  grwajax.prototype = {
    _init: function(pars, parameters) {
      if(typeof pars.url == 'undefined') {
        return false;
      }
      /**
      * @private
      */
      var  GL = GRW.lang,
          isUndef = GL.isUndef,
          isFunction = GL.isFunction;

      this.createEvent(onStartRequest);

      this.url = pars.url;
      this.pars = isUndef(pars.pars) ? this.pars : pars.pars;
      this.handler = isUndef(pars.handler) ? this.handler :  pars.handler;
      this.method = isUndef(pars.method)? 'get' : pars.method;
      this.successHandler = isUndef(pars.successHandler)? this.successHandler : pars.successHandler;
      this.onError = isFunction(pars.onError) ? pars.onError : null;
      this.onSuccess = isFunction(pars.onSuccess) ? pars.onSuccess : null;
      this.parameters = typeof parameters != 'undefined' ? parameters : null;

      this._initRequest();
    },
    _initRequest: function() {
      if(this.req) return;
      var agent = 'Google Reader Watcher ###VERSION###';

      this.req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
      // Fix Firefox 3 third party cookie related bug
      // https://bugzilla.mozilla.org/show_bug.cgi?id=437174#c32
      var ds = Cc["@mozilla.org/webshell;1"].createInstance(Ci.nsIDocShellTreeItem).QueryInterface(Ci.nsIInterfaceRequestor);
      ds.itemType = Ci.nsIDocShellTreeItem.typeContent;

      //this.req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

      this.req.open(this.method, this.url, true);
      this.req.channel.loadGroup = ds.getInterface(Ci.nsILoadGroup); // fix ff3
      this.req.channel.loadFlags |= Ci.nsIChannel.LOAD_DOCUMENT_URI; // fix ff3
      this.req.setRequestHeader('User-Agent', agent);
      this.req.setRequestHeader('Accept-Charset','utf-8');
      this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if(this.method == 'post') {
        this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      }
      this.req.onreadystatechange = this.handler.call(this);
    },
    send: function() {
      this.fireEvent(onStartRequest);
      this.req.send(this.createParameters());
    },
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
  GRW.augmentProto(grwajax, GRW.EventProvider);
  GRW.Ajax = grwajax;
})();
