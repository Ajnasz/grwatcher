(function(){
  var startRequest = 'startRequest',
      requestSuccess = 'requestSuccess',
      requestFailed = 'requestFailed',
  /**
   * AJAX requester class
   * @constructor
   * @class Ajax
   * @namespace GRW
   *
   * @param {Object} pars  object to configure the AJAX request
   *  {String} url the url of the request
   *  {String} [method] request method (eg.: get, post, head)
   * @param {String} [parameters] if the method should be post, this variable contains the request parameters
   */
  grwajax = function(pars, parameters) {
    this._init.apply(this, arguments);
  };
  grwajax.prototype = {
    _init: function(pars, parameters) {
      var GL = GRW.lang,
          isUndef = GL.isUndef,
          isFunction = GL.isFunction;

      if(isUndef(pars.url)) {
        GRW.log('url is undefined');
        return false;
      }

      this.url = pars.url;
      this.pars = isUndef(pars.pars) ? this.pars : pars.pars;
      this.handler = isUndef(pars.handler) ? this.handler :  pars.handler;
      this.method = isUndef(pars.method)? 'get' : pars.method;
      this.onError = isFunction(pars.onError) ? pars.onError : function() {};
      this.onSuccess = isFunction(pars.onSuccess) ? pars.onSuccess : function() {};
      this.parameters = isUndef('undefined') ? null : parameters;
      this.subscribe(requestSuccess, this.onSuccess);
      this.subscribe(requestFailed, this.onError);

      this._initRequest();
    },
    _initRequest: function() {
      if(this.req) return;
      var agent = 'Google Reader Watcher ###VERSION###';

      this.req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
      // var sid = GRW.LoginManager.getCurrentSID();
      // if(sid) {
        // this.req.setRequestHeader('Cookie', 'SID=' + sid + ';')
      // };

      //this.req = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

      this.req.open(this.method, this.url, true);
      if(Cc["@mozilla.org/webshell;1"]) {
        // Fix Firefox 3 third party cookie related bug
        // https://bugzilla.mozilla.org/show_bug.cgi?id=437174#c32
        // Should put into the if statment because there is no webshell interface in fennec 
        var ds = Cc["@mozilla.org/webshell;1"].createInstance(Ci.nsIDocShellTreeItem).QueryInterface(Ci.nsIInterfaceRequestor);
        ds.itemType = Ci.nsIDocShellTreeItem.typeContent;
        this.req.channel.loadGroup = ds.getInterface(Ci.nsILoadGroup); // fix ff3
        this.req.channel.loadFlags |= Ci.nsIChannel.LOAD_DOCUMENT_URI; // fix ff3
      }

      this.req.setRequestHeader('User-Agent', agent);
      this.req.setRequestHeader('Accept-Charset','utf-8');
      this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      if(this.method == 'post') {
        this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      }
      var _this = this;
      this.req.onreadystatechange = function() {_this.handler.call(_this);};
    },
    send: function() {
      grwajax.onStartRequest.fire();
      this.fireEvent(startRequest);
      this.req.send(this.createParameters());
    },
    /**
     * readystatechange handler function
     */
    handler: function() {
      try {
        if(this.req.readyState == 4) {
          if(typeof this.req.status != 'undefined') {
            if(this.req.status == 200) {
              grwajax.onRequestSuccess.fire(this.req);
              this.fireEvent(requestSuccess, this.req);
            } else {
              grwajax.onRequestFailed.fire('statuscode', this.req);
              this.fireEvent(requestFailed, this.req);
              return this.errorHandler('status code - ' + this.req.status);
            };
          } else {
            grwajax.onRequestFailed.fire('networkerror', this.req);
            this.fireEvent(requestFailed, 'networkerror');
            return this.errorHandler('no status code');
          }
        }
      } catch(Exception) {
        grwajax.onRequestFailed.fire('networkerror', this.req);
        this.fireEvent(requestFailed, 'networkerror');
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
      GRW.log('error handler')
      /*
      if(typeof this.onError == 'function') {
        this.onError();
      }
      */
      var msgs = [];
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
        GRW.log('response headers: ', this.req.getAllResponseHeaders());
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
  grwajax.onRequestFailed = new GRW.CustomEvent('onRequestFailed');
  grwajax.onStartRequest = new GRW.CustomEvent('onStartRequest');
  grwajax.onRequestSuccess = new GRW.CustomEvent('onRequestSuccess');
  GRW.augmentProto(grwajax, GRW.EventProvider);
  GRW.module('Ajax', grwajax);
})();
(function() {
  var token = function(args, force) {
    var runFn = function() {
      if(args) {
        var success = args.success;
        if(GRW.lang.isFunction(success.fn)) {
          success.fn.call(success.scope);
        }
      }
    },
    update = function(fn, arg) {
      new GRW.Ajax({
        url: GRW.States.conntype + '://www.google.com/reader/api/0/token',
        onSuccess: function(r) {
          // GRW.setCookie('T', r.responseText);
          GRW.token = {
            token: r.responseText,
            date: new Date()
          }
          runFn();
        },
        onError: function() {
          var failure = args.failure;
          failure.fn.call(failure.scope);
        }
      }).send();
    },
    isValid = function() {
      return !(!GRW.token || !GRW.token.date || Math.round(((new Date()).getTime() - GRW.token.date.getTime())/1000/60) > 5 );
    };

    if(!isValid() || force) {
      update();
    } else {
      runFn();
    }
  };
  GRW.module('Token', token);
})();
