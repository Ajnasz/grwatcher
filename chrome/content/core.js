let GRW = {};
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
  Components.utils.import("resource://grwmodules/CustomEvent.jsm");
  Components.utils.import("resource://grwmodules/GRWUri.jsm");

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


  GRW.module('lang', lang);
})();
