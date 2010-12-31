(function() {
  var showCounter = function(label, toolbar, value) {
    if(label) {
      label.value = value;
      label.style.width = '';
      label.style.margin = '';
      label.crop = '';
      label.collapsed = false;
    }
    if(toolbar) {
      toolbar.value = value;
      toolbar.style.width = '';
      toolbar.style.margin = '';
      toolbar.crop = '';
      toolbar.collapsed = false;
      // toolbar.label = value;
    }
  },
  hideCounter = function(label, toolbar) {
    if(label) {
      label.value = '';
      label.crop = 'end';
      label.style.margin = 0;
      label.style.width = 0;
      label.collapsed = true;
    }
    if(toolbar) {
      toolbar.value = '';
      toolbar.crop = 'end';
      toolbar.style.margin = 0;
      toolbar.style.width = 0;
      toolbar.collapsed = true;
      // toolbar.label = '';
    }
  };
  var statusbarCounter = {
    update: function(val, maxcount) {

      var showZeroCounter = GRW.Prefs.get.showZeroCounter(),
          showval;
      if(GRW.Prefs.get.maximizeCounter() && maxcount && val > maxcount) {
        showval = maxcount + '+';
      } else {
        showval = val;
      }
      GRW.UI.MapWindows(function(win) {
        var label = win.document.getElementById('GRW-statusbar-label'),
            toolbarButton = win.document.getElementById('GRW-toolbar-label');

        (val > 0 || showZeroCounter)
          ? showCounter(label, toolbarButton, showval)
          : hideCounter(label, toolbarButton);
      });
    },
  };
  GRW.UI.StatusbarCounter = statusbarCounter;
})();
