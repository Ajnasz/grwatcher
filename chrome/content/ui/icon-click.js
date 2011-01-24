(function() {
  const customDefs = {
        2: 'dblclick',
        1: 'click',
      },
      doc = document;

  var iconClick = function() {
    this.init.apply(this, arguments);
  };
  iconClick.prototype = {
    init: function() {
      var _this = this,
      elements = [document.getElementById('GRW-statusbar'), document.getElementById('GRW-toolbar-button'), document.getElementById('GRW-toolbar-label')];
      elements.forEach(function(element) {
        if(element) {
          element.addEventListener('click', function(event){
            _this.click(event);
            }, true);
          element.addEventListener('dblclick', function(event){
            _this.click(event)
          }, true);
        }
      })
      this.elements = elements;
    },
    click: function(event) {
      var type = event.type,
          button = event.button,
          conf = GRW.Prefs.get.leftClickOpen(),
          elementClicked = false;

      this.elements.forEach(function(element) {
        var target = event.originalTarget;
        if(element && target == element || target.nodeName.toLowerCase() == 'image' || target.nodeName.toLowerCase() == 'label') {
          elementClicked = true;
        }
      });
      if(!elementClicked) {
        return;
      }

      switch(button) {
        case 0:
          if(customDefs[conf] == type) {
            this.fireEvent('iconClick', [type, event]);
          }
          break;
        case 1:
          this.fireEvent('iconMiddleClick', [type, event]);
          break;
        default:
          break;
      }
    },
  };
  Components.utils.import("resource://grwmodules/Augment.jsm");
  augmentProto(iconClick, GRW.EventProvider);
  GRW.module('IconrClick', iconClick);
})();
