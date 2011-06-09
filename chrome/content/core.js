let GRW = {};
GRW.module = function(moduleName, module) {
  if(typeof moduleName === 'string') {
    if(typeof GRW[moduleName] === 'undefined') {
      GRW[moduleName] = module || {};
    }
    return GRW[moduleName];
  }
  return false;
};

(function(){
  Components.utils.import("resource://grwmodules/CustomEvent.jsm");

  var lang = {
    isString: function(arg) {
      return typeof(arg) === 'string';
    },
    isNumber: function(arg) {
      return typeof(arg) === 'number';
    },
    isBoolean: function(arg) {
      return typeof(arg) === 'boolean';
    },
    isFunction: function(arg) {
      return typeof(arg) === 'function';
    },
    isNull: function(arg) {
      return arg === null;
    },
    isArray: function(arg) {
      return typeof arg === 'object' && lang.isNumber(arg.length) && lang.isFunction(arg.slice);
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


  GRW.module('lang', lang);
})();
