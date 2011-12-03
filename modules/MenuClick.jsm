/*jslint indent:2*/
var scope = {};
var MenuClick = function (rootElem, elements, doc) {
  this.rootElem = rootElem;
  this.elements = elements;
  this.doc = doc;
};
MenuClick.prototype = {
  init: function () {
    var _this = this,
        scope = {},
        rootElem;
    rootElem = this.doc.getElementById(this.rootElem);
    if (rootElem) {
      rootElem.addEventListener('command', function (ev) {
        var cfg = _this.getElemCfg(ev.target.id);
        if (cfg) {
          _this.fireEvent(cfg.event);
        }
      }, false);
    }
    /*
    this.elements.forEach(function (elemCfg) {
      if (!elemCfg.element) {
        var element = _this.doc.getElementById(elemCfg.id);
        if (element) {
          elemCfg.element = element;
          element.addEventListener('command', function (event) {
            _this.fireEvent(elemCfg.event);
          }, true);
      }
      }
    });
    */
  },
  getElemCfg: function (id) {
    return this.elements.filter(function (elem) {
      return elem.id === id;
    }).shift();
  }
};

Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
/*global augmentProto: true, EventProvider: true*/
scope.augmentProto(MenuClick, scope.EventProvider);
let EXPORTED_SYMBOLS = ['MenuClick'];
