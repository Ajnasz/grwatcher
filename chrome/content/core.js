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
   *  Other arguments are optional, but if it's a string then it will be added to the
   *  domain with a / or if it's an object, it's key value pairs will be used as a
   *  query parameter
   */
  var uri = function(domain) {
      let args =lang.toArray(arguments),
          uriRoot = args.shift(),
          uriParts = [],
          queryParams = [],
          connectionType = GRW.States.conntype,
          output = '';

      while(args.length) {
        let part = args.shift();
        if(typeof part == 'string') {
            uriParts.push(part);
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
  /**
   * Applies all properties in the supplier to the receiver if the
   * receiver does not have these properties yet.  Optionally, one or 
   * more methods/properties can be specified (as additional 
   * parameters).  This option will overwrite the property if receiver 
   * has it already.  If true is passed as the third parameter, all 
   * properties will be applied and _will_ overwrite properties in 
   * the receiver.
   *
   * @method augmentObject
   * @namespace GRW
   * @static
   * @since 2.3.0
   * @see YAHOO.lang.augmentObject
   * @param {Function} r  the object to receive the augmentation
   * @param {Function} s  the object that supplies the properties to augment
   * @param {String*|boolean}  arguments zero or more properties methods 
   *        to augment the receiver with.  If none specified, everything
   *        in the supplier will be used unless it would
   *        overwrite an existing property in the receiver. If true
   *        is specified as the third parameter, all properties will
   *        be applied and will overwrite an existing property in
   *        the receiver
   */
  var augmentObject = function(r, s) {
    if (!s||!r) {
        throw new Error("Absorb failed, verify dependencies.");
    }
    var a=arguments, overrideList=a[2];
    if (overrideList && overrideList!==true) { // only absorb the specified properties
      for (let i=2, al = a.length; i<al; i=i+1) {
          r[a[i]] = s[a[i]];
      }
    } else { // take everything, overwriting only if the third parameter is true
      for (let p in s) {
        if (overrideList || !(p in r)) {
          r[p] = s[p];
        }
      }
    }
  };

  /**
   * Same as GRW.augmentObject, except it only applies prototype properties
   * @see GRW.augmentObject
   * @see YAHOO.lang.augmentProto
   * @method augmentProto
   * @static
   * @param {Function} r  the object to receive the augmentation
   * @param {Function} s  the object that supplies the properties to augment
   * @param {String*|boolean}  arguments zero or more properties methods
   *        to augment the receiver with.  If none specified, everything
   *        in the supplier will be used unless it would overwrite an existing
   *        property in the receiver.  if true is specified as the third
   *        parameter, all properties will be applied and will overwrite an
   *        existing property in the receiver
   */
  var augmentProto = function(r, s) {
    if (!s||!r) {
        throw new Error("Augment failed, verify dependencies.");
    }
    var a=[r.prototype,s.prototype];
    for (let i=2, al = arguments.length;i<al;i=i+1) {
        a.push(arguments[i]);
    }
    augmentObject.apply(this, a);
  };
  /**
   * @class EventProvider
   * @namespace GRW
   */
  var eventProvider = function() {
  };
  eventProvider.prototype = {
    subscribe: function(eventName, fn, obj, overrideContext) {
      if(!this._subscribers) {
        this._subscribers = {};
      }
      if(!this._subscribers[eventName]) {
        this._subscribers[eventName] = [];
      }
      this._subscribers[eventName].push({fn:fn, obj: obj, overrideContext: overrideContext});
    },
    on: function() {
      this.subscribe.apply(this, arguments);
    },
    fireEvent: function(eventName, args) {
      if(!this._subscribers || !this._subscribers[eventName]) return;
      var subscribers = this._subscribers[eventName];
      for (let i = 0, sl = subscribers.length; i < sl; i++) {
        subscription = subscribers[i];
        subscription.fn.call(subscription.context || this, args);
      }
    }
  };

  var customEvent = function(eventName) {
    this.eventName = eventName;
  };
  customEvent.prototype = {
    fire: function(args) {
      var args = lang.toArray(arguments);
      this.fireEvent(this.eventName, args);
    },
    subscribe: function(fn, obj, overrideContext) {
      eventProvider.prototype.subscribe.apply(this, [this.eventName, fn, obj, overrideContext]);
    },
  };
  augmentProto(customEvent, eventProvider);

  GRW.module('lang', lang);
  GRW.module('log', log);
  GRW.module('later', later);
  GRW.module('never', never);
  GRW.module('uri', uri);
  GRW.module('augmentObject', augmentObject);
  GRW.module('augmentProto', augmentProto);
  GRW.module('EventProvider', eventProvider);
  GRW.module('CustomEvent', customEvent);

})();
