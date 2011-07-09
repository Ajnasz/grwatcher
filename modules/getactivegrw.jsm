var getActiveGRW = function (w) {
  // if(typeof Components === 'undefined') {
  //   return;
  // }
  var activeWin = false, scope ={};
  Components.utils.import("resource://grwmodules/mapwindows.jsm", scope);
  scope.mapwindows(function(win) {
    if(win.GRWActive === true) {
      activeWin = win;
    }
  });
  return (activeWin === false) ? w : activeWin;
};
let EXPORTED_SYMBOLS = ['getActiveGRW'];
