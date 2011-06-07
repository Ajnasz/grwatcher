/*jslint indent:2*/
var MenuClick = function (elements, doc) {
  this.elements = elements;
  this.doc = doc;
};
MenuClick.prototype = {
  init: function () {
    var _this = this;
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
  }
};

Components.utils.import("resource://grwmodules/Augment.jsm");
Components.utils.import("resource://grwmodules/EventProvider.jsm");
/*global augmentProto: true, EventProvider: true*/
augmentProto(MenuClick, EventProvider);
let EXPORTED_SYMBOLS = ['MenuClick'];
