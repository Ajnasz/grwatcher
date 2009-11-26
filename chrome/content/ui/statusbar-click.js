(function() {
  const customDefs = {
        2: 'dblclick',
        1: 'click',
      },
      doc = document;

  var statusbarClick = function() {
    this.init.apply(this, arguments);
  };
  statusbarClick.prototype = {
    init: function() {
      var _this = this,
      element = document.getElementById('GRW-statusbar');

      if(element) {
        element.addEventListener('click', function(event){_this.click(event)}, true);
        element.addEventListener('dblclick', function(event){_this.click(event)}, true);
      }
      this.element = element;
    },
    click: function(event) {
      var type = event.type,
          button = event.button,
          conf = GRW.Prefs.get.leftClickOpen();
      if(event.originalTarget != this.element) {
        return;
      }

      switch(button) {
        case 0:
          if(customDefs[conf] == type) {
            this.fireEvent('statusbarClick', [type, event]);
          }
          break;
        case 1:
          this.fireEvent('statusbarMiddleClick', [type, event]);
          break;
        default:
          break;
      }
    },
  };
  GRW.augmentProto(statusbarClick, GRW.EventProvider);
  GRW.module('StatusbarClick', statusbarClick);
})();
