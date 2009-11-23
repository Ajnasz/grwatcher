(function() {
  var statusbarCounter = {
    update: function(val, maxcount) {
      
      if(GRW.Prefs.get.maximizeCounter() && maxval && val > maxcount) {
        val = maxcount + '+';
      }
      var showZeroCounter = GRW.Prefs.get.showZeroCounter();
      GRW.UI.MapWindows(function(win) {
        var label = win.document.getElementById('GRW-statusbar-label');
        showZeroCounter
          ? statusbarCounter.show(label, val)
          : statusbarCounter.hide(label);
      });
    },
    show: function(label, value) {
        label.value = value;
        label.style.width = '';
        label.style.margin = '';
        label.crop = '';
        label.collapsed = false;
    },
    hide: function(label) {
      label.value = '';
      label.crop = 'end';
      label.style.margin = 0;
      label.style.width = 0;
      label.collapsed = true;
    }
  };
  GRW.UI.StatusbarCounter = statusbarCounter;
})();
