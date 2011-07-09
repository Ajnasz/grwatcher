/*jslint indent:2*/
var scope = {};
/*global Components: true*/
var tooltipPopupShowing = 'tooltipPopupShowing',
    tooltipPopupHiding = 'tooltipPopupHiding',
    tooltipMouseOver = 'tooltipMouseOver',
    tooltipMouseOut = 'tooltipMouseOut';


var TooltipHandler = function (elements, doc) {
  this.doc = doc;
  this.getElements(elements, doc);
};
TooltipHandler.prototype = {
  getElements: function (elements) {
    if (!this.elements) {
      this.elements = [];
    }
    var doc = this.doc,
        _this = this;
    elements.forEach(function (elem) {
      var element = doc.getElementById(elem);
      if (element) {
        if (!_this.elements.some(function (elem) {
          return elem === element;
        })) {
          _this.elements.push(element);
          _this.addListeners(element);
        }
      }
    });
  },
  addListeners: function (element) {
    if (element) {
      var hideAllowed, _this = this;
      element.addEventListener('popupshowing', function (event) {
        hideAllowed = false;
        _this.popupShowing(event, element);
      }, true);
      element.addEventListener('popuphiding', function (event) {
        _this.popupHiding(event, element);
        if (!hideAllowed) {
          event.preventDefault();
        }
      }, true);
      element.addEventListener('mouseover', function (event) {
        hideAllowed = false;
        _this.mouseOver(event, element);
      }, true);
      element.addEventListener('mouseout', function (event) {
        hideAllowed = true;
        _this.mouseOut(event, element);
      }, true);
      element.addEventListener('mousemove', function (event) {
        hideAllowed = true;
        if (element.tooltip) {
          var tooltipElem = _this.doc.getElementById(element.tooltip);
          if (tooltipElem) {
            tooltipElem.hidePopup();
          }
        }
      }, true);
    }
  },
  mouseOver: function (event, element) {
    this.fireEvent(tooltipMouseOver, [event, element]);
  },
  mouseOut: function (event, element) {
    this.fireEvent(tooltipMouseOut, [event, element]);
  },
  popupHiding: function (event, element) {
    this.fireEvent(tooltipPopupHiding, [event, element]);
  },
  popupShowing: function (event, element) {
    this.fireEvent(tooltipPopupShowing, [event, element]);
  },
};
Components.utils.import("resource://grwmodules/Augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(TooltipHandler, scope.EventProvider);
let EXPORTED_SYMBOLS = [
  'TooltipHandler',
  'tooltipPopupShowing',
  'tooltipPopupHiding',
  'tooltipMouseOver',
  'tooltipMouseOut'
];
