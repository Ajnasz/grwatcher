let GRW = {
  JSON: null
};
Components.utils.import("resource://grwmodules/JSON.jsm", GRW);
GRW.module = function(moduleName, module) {
  if(typeof moduleName == 'string') {
    if(typeof GRW[moduleName] == 'undefined') {
      GRW[moduleName] = module || {};
    }
    return GRW[moduleName];
  }
  return false;
};

(function(){
  Components.utils.import("resource://grwmodules/Augment.jsm");
  Components.utils.import("resource://grwmodules/EventProvider.jsm");
  Components.utils.import("resource://grwmodules/CustomEvent.jsm");

  var lang = {
    isString: function(arg) {
      return typeof(arg) === 'string' || arg instanceof String;
    },
    isNumber: function(arg) {
      return typeof(arg) === 'number' || arg instanceof Number;
    },
    isBoolean: function(arg) {
      return typeof(arg) === 'boolean' || arg instanceof Boolean;
    },
    isFunction: function(arg) {
      return typeof(arg) === 'function' || arg instanceof Function;
    },
    isNull: function(arg) {
      return arg === null;
    },
    isArray: function(arg) {
      return arg instanceof Array;
    },
    isObject: function(arg) {
      return typeof(arg) === 'object' && !lang.isNull(arg) && !lang.isString(arg) && lang.isNumber(arg) && !lang.isFunction(arg) && !lang.isBoolean(arg);
    },
    isUrl: function(arg) {
      return lang.isString(arg) && /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(arg);
    },
    isUndef: function(arg) {
      var undefined;
      return arg === undefined;
    },
    toArray: function(arg) {
      var _a = [];
      return _a.slice.call(arg);
    },
    isEmail: function(arg) {

    },
  };
  /**
   * Core JavaScript namespace for the Google Reader Watcher extension
   *
   * @module GRW
   */

  /**
   * Logger method which writes messages to the error console
   * @method log
   *
   * @namespace GRW
   *
   * @param {String} message log on the javascript console
   */
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  var log = function() {
    if(GRW.Prefs.get.debug()) {
      var msg = [];
      for(let i = 0, al = arguments.length, arg, message; i< al; i++) {
        arg = arguments[i];
        if(arg instanceof Error) {
          message = [];
          message.push('aaa');
          for(let j in arg) {
            //if(arg.hasOwnProperty(j)) {
              message.push(j + ' = ' + arg[j]);
            //}
          }
          message = message.join('\n');
        } else {
          message = arg;
        }
        msg.push(arg);
      }
      consoleService.logStringMessage('GRW: ' + msg.join(',\n'));
    }
  };

  var timer = Components.classes["@mozilla.org/timer;1"]
                .createInstance(Components.interfaces.nsITimer);
  var later = function(fn, delay) {
    var callback = {notify: fn};
    timer.initWithCallback(callback, delay, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    return timer;
  };
  var never = function(timer) {
    if(timer && GRW.lang.isFunction(timer.cancel)) {
      timer.cancel();
    }
  };

  var uriRex_ = new RegExp('^https?://');
  /**
   * @namespace GRW
   * @method uri
   * @description Creates urls
   * @param {String} domain the domain name of the url
   *  Other arguments are optional, but if it's a string then it will be added
   *  to the domain with a / or if it's an object, it's key value pairs will be
   *  used as a query parameter
   *  if its a boolean it will mean that the uri should be extended with client
   *  and ck params or not
   */
  var uri = function(domain) {
      let args =lang.toArray(arguments),
          uriRoot = args.shift(),
          uriParts = [],
          queryParams = [],
          connectionType = GRW.States.conntype,
          output = '',
          shouldExtend = true;

      while(args.length) {
        let part = args.shift();
        let type = typeof part;
        if(type == 'string') {
            uriParts.push(part);
        } else if(type == 'boolean') {
          shouldExtend = part;
          break;
        } else {
            for(let i in part) {
                if(part.hasOwnProperty(i)) {
                    queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(part[i]));
                }
            }
            break;
        }
      }
      output = uriRoot;
      if(uriParts.length > 0) {
          output += '/' + uriParts.join('/');
      }
      if(shouldExtend) {
        queryParams.push('client=grwatcher&ck=' + new Date().getTime());
      }
      if(queryParams.length > 0) {
          output += '?' + queryParams.join('&');
      }
      if(uriRex_.test(output)) {
          output = output.replace(uriRex, '');
      }
      output = connectionType + '://' +  output;
      GRW.log(output);
      return output;
  };

  var getBrowserVersion = function () {
    var version = null,
        ua = navigator.userAgent.toString(),
        versionMatch;

    if (/Firefox|SeaMonkey/.test(ua)) {
      versionMatch = ua.match(/(?:Firefox|SeaMonkey)\/([\d.]+)/);
      if (versionMatch) {
        version = versionMatch[1];
      }
    }
    return version;
  };

  GRW.module('lang', lang);
  GRW.module('log', log);
  GRW.module('later', later);
  GRW.module('never', never);
  GRW.module('uri', uri);
  GRW.module('augmentObject', augmentObject);
  GRW.module('augmentProto', augmentProto);
  GRW.module('getBrowserVersion', getBrowserVersion);
  GRW.module('EventProvider', EventProvider);
  GRW.module('CustomEvent', CustomEvent);

})();
