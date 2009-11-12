if(typeof GRW === 'undefined') GRW = {};
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
    isEmail: function(arg) {

    },
  };
  /**
  * Core JavaScript namespace for the Google Reader Watcher extension
  *
  * @module GRW
  */
  GRW.lang = lang;
})();
(function() {
  /**
  * Logger method which writes messages to the error console
  * @method log
  *
  * @namespace GRW
  *
  * @param {String} message log on the javascript console
  */
  GRW.log = function() {
    var msg = [];
    for(var i = 0, al = arguments.length; i< al; i++) {
      msg.push(arguments[i]);
    }
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage('GRW: ' + msg.join(',\n'));
  };
})();


/**
 * A SandBox module, to handle the GRW Modules
 * @module SandBox
 *
 * @namespace GRW
 */
GRW.SandBox = {
  modules: {},
  /**
   * Register a module into the grw sandbox
   *
   * @method register
   *
   * @param {String} name The name of the module
   * @param {Array} [depedencies] Module depedencies
   */
  register: function (name, depedencies) {
  },
  /**
   * Notifies the registered modules about events
   * 
   * @method notify
   *
   * @param {String} notifier The name of the module which did an event
   * @param {String} event The name of the event which has been fired
   * @param {Array | Object | String} [context] Arguments, objects, etc. which could be passed to another module
   */
  notify: function(notifier, event, context) {
    var module;
    for(var moduleName in this.modules) {
      module = this.modules[moduleName];
      module.happening(notifier, event, context);
    }
  }
};


GRW.Module = function() {
};
GRW.Module.prototype = {
  register: function() {
    GRW.SandBox.register(this.name, this.depedencies);
  },
  happening: function(notifier, event, context) {
  }
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
GRW.augmentObject = function(r, s) {
  if (!s||!r) {
      throw new Error("Absorb failed, verify dependencies.");
  }
  var a=arguments, i, p, overrideList=a[2];
  if (overrideList && overrideList!==true) { // only absorb the specified properties
      for (i=2; i<a.length; i=i+1) {
          r[a[i]] = s[a[i]];
      }
  } else { // take everything, overwriting only if the third parameter is true
      for (p in s) { 
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
GRW.augmentProto = function(r, s) {
  if (!s||!r) {
      throw new Error("Augment failed, verify dependencies.");
  }
  var a=[r.prototype,s.prototype], i;
  for (i=2;i<arguments.length;i=i+1) {
      a.push(arguments[i]);
  }
  GRW.augmentObject.apply(this, a);
};

GRW.CustomEvent = function(type, scope) {
  this.type = type;
  this.scope = scope || window;
}
GRW.CustomEvent.prototype = {
  subscribers: [],
  subscribe: function() {
  }
}

/**
 * @class EventProvider
 * @namespace GRW
 */
GRW.EventProvider = function() {
};
GRW.EventProvider.prototype = {
  createEvent: function(type) {
    if(!GRW.lang.isObject(this._events)) {
      this._events = {};
    }
    this._events[type] = true;
  },
  subscribe: function(type, fn, obj, overrideContext) {
    if(!GRW.lang.isObject(this._subscribers)) {
      this._subscribers = {};
    }
    if(!this._subscribers[type]) {
      this._subscribers[type] = [];
    }
    this._subscribers[type].push({fn:fn, obj: obj, overrideContext: overrideContext});
  },
  on: function() {
    this.subscribe.apply(this, arguments);
  },
  fireEvent: function(type, args) {
    if(!this._subscribers) return;
    var subscribers = this._subscribers[type];
    for(var i in subscribers) {
      if(subscribers.hasOwnProperty(i)) {
        subscription = subscribers[i];
        subscription.fn.call(subscription.context, args);
      }
    }
  }
};
