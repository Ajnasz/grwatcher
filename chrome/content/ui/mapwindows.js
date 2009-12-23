(function() {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator);

var mapwindows = function(fn, args, scope) {
    var win,
        enumerator = wm.getEnumerator('navigator:browser');
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined') {
        if(!scope) {
          scope = win;
        }
        if(!GRW.lang.isArray(args)) {
          args = [win];
        } else {
          args.unshift(win);
        }
        fn.apply(scope, args);
      }
    }
  };
  GRW.UI.MapWindows = mapwindows;
})();
