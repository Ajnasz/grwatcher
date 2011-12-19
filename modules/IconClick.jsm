/*jslint indent:2*/
var scope = {};
/*global Components: true*/
var customDefs = {
    2: 'dblclick',
    1: 'click'
  },
  iconClickEvent = 'iconClick',
  iconMiddleClickEvent = 'iconMiddleClick';

var IconClick = function (elements, doc) {
  this.doc = doc;
  this.addElements(elements);
};
IconClick.prototype = {
  addElements: function (elements) {
    if (!this.elements) {
      this.elements = [];
    }
    if (elements && elements.length > 0) {
      var _this = this,
          doc = this.doc;
      elements.forEach(function (elem) {
        var element = doc.getElementById(elem);
        if (element) {
          // element not added yet
          if (!_this.elements.some(function (elem) {
            return elem === element;
          })) {
            _this.elements.push(element);
            _this.addListeners(element);
          }
        }
      });
    }
  },
  addListeners: function (element) {
    if (element) {
      var _this = this;
      element.addEventListener('click', function (event) {
        _this.click(event);
      }, true);
      element.addEventListener('dblclick', function (event) {
        _this.click(event);
      }, true);
    }
  },
  click: function (event) {
    var type = event.type,
        button = event.button,
        conf = -1,
        elementClicked = false,
        prefManager;

    this.elements.forEach(function (element) {
      var target = event.originalTarget;
      if (element && target === element ||
      target.nodeName.toLowerCase() === 'image' ||
      target.nodeName.toLowerCase() === 'label') {
        elementClicked = true;
      }
    });
    if (!elementClicked) {
      return;
    }
    prefManager = Components.classes["@mozilla.org/preferences-service;1"]
      .getService(Components.interfaces.nsIPrefBranch);
    conf = prefManager.getIntPref('extensions.grwatcher.leftclickopen');

    switch (button) {
    case 0:
      if (customDefs[conf] === type) {
        this.fireEvent(iconClickEvent, [type, event]);
      }
      break;
    case 1:
      this.fireEvent(iconMiddleClickEvent, [type, event]);
      break;
    default:
      break;
    }
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(IconClick, scope.EventProvider);
let EXPORTED_SYMBOLS = ['IconClick', 'iconClickEvent', 'iconMiddleClickEvent'];
