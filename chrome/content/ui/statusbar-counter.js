(function() {
  var showCounter = function(label, value) {
      label.value = value;
      label.style.width = '';
      label.style.margin = '';
      label.crop = '';
      label.collapsed = false;
  },
  hideCounter = function(label) {
    label.value = '';
    label.crop = 'end';
    label.style.margin = 0;
    label.style.width = 0;
    label.collapsed = true;
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
            toolbarButton = win.document.getElementById('GRW-toolbar-button');

        (val > 0 || showZeroCounter)
          ? showCounter(label, showval)
          : hideCounter(label);
      if(toolbarButton) {
        toolbarButton.label = showval;
      }
      });
    },
  };
  GRW.UI.StatusbarCounter = statusbarCounter;
})();
