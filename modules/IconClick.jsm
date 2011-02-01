const customDefs = {
      2: 'dblclick',
      1: 'click',
    },
    iconClickEvent = 'iconClick',
    iconMiddleClickEvent = 'iconMiddleClick';

var IconClick = function(elements, doc) {
  this.elements = elements.map(function (elem) {
    return doc.getElementById(elem);
  });
  this.init.apply(this, arguments);
};
IconClick.prototype = {
  init: function() {
    var _this = this;
    this.elements.forEach(function (element) {
      if(element) {
        element.addEventListener('click', function(event){
          _this.click(event);
          }, true);
        element.addEventListener('dblclick', function(event){
          _this.click(event)
        }, true);
      }
    })
  },
  click: function(event) {
    var type = event.type,
        button = event.button,
        conf = -1,
        elementClicked = false,
        prefManager;

    this.elements.forEach(function(element) {
      var target = event.originalTarget;
      if(element && target == element || target.nodeName.toLowerCase() == 'image' || target.nodeName.toLowerCase() == 'label') {
        elementClicked = true;
      }
    });
    if(!elementClicked) {
      return;
    }
    prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch)
    conf = prefManager.getIntPref('extensions.grwatcher.leftclickopen');

    switch(button) {
      case 0:
        if(customDefs[conf] == type) {
          this.fireEvent(iconClickEvent, [type, event]);
        }
        break;
      case 1:
        this.fireEvent(iconMiddleClickEvent, [type, event]);
        break;
      default:
        break;
    }
  },
};
Components.utils.import("resource://grwmodules/Augment.jsm");
Components.utils.import("resource://grwmodules/EventProvider.jsm");
augmentProto(IconClick, EventProvider);
let EXPORTED_SYMBOLS = ['IconClick', iconClickEvent, iconMiddleClickEvent];
