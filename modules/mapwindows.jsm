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
      if(!(typeof args === 'object' && typeof args.length === 'number')) {
        args = [win];
      } else {
        args.unshift(win);
      }
      fn.apply(scope, args);
    }
  }
};

let EXPORTED_SYMBOLS = ['mapwindows'];
