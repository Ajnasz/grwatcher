(function() {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator);

  var mapwindows = function(fn, scope) {
    var win,
        enumerator = wm.getEnumerator('navigator:browser');
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined') {
        fn(win);
      }
    }
  };
  GRW.UI.MapWindows = mapwindows;
})();
