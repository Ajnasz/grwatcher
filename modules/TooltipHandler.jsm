const tooltipPopupShowing = 'tooltipPopupShowing',
    tooltipPopupHiding = 'tooltipPopupHiding',
    tooltipMouseOver = 'tooltipMouseOver',
    tooltipMouseOut = 'tooltipMouseOut';


var TooltipHandler = function (elements, doc) {
  this.doc = doc;
  this.elements = elements.map(function (elem) {
    return doc.getElementById(elem);
  });
  this.init();
};
TooltipHandler.prototype = {
  init: function () {
    var _this = this;
    this.elements.forEach(function (element) {
      if (element) {
        var hideAllowed;
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
    });
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
Components.utils.import("resource://grwmodules/Augment.jsm");
Components.utils.import("resource://grwmodules/EventProvider.jsm");
augmentProto(TooltipHandler, EventProvider);
let EXPORTED_SYMBOLS = [
  'TooltipHandler',
  'tooltipPopupShowing',
  'tooltipPopupHiding',
  'tooltipMouseOver',
  'tooltipMouseOut'
];
