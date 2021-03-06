/*jslint indent:2*/
/*global Components: true*/
var scope = {};
var showCounter = function (label, toolbar, value) {
  if (label) {
    label.value = value;
    label.style.width = '';
    label.style.margin = '';
    label.crop = '';
    label.collapsed = false;
  }
  if (toolbar) {
    toolbar.value = value;
    toolbar.style.width = '';
    toolbar.style.margin = '';
    toolbar.crop = '';
    toolbar.collapsed = false;
    // toolbar.label = value;
  }
},
hideCounter = function (label, toolbar) {
  if (label) {
    label.value = '';
    label.crop = 'end';
    label.style.margin = 0;
    label.style.width = 0;
    label.collapsed = true;
  }
  if (toolbar) {
    toolbar.value = '';
    toolbar.crop = 'end';
    toolbar.style.margin = 0;
    toolbar.style.width = 0;
    toolbar.collapsed = true;
    // toolbar.label = '';
  }
};
var iconCounter = {
  update: function (val, maxcount) {

    Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    var counterEnabled = scope.prefs.get.showCounter(),
        showZeroCounter = scope.prefs.get.showZeroCounter(),
        showval;
    if (scope.prefs.get.maximizeCounter() && maxcount && val > maxcount) {
      showval = maxcount + '+';
    } else {
      showval = val;
    }
    Components.utils.import("resource://grwmodules/mapwindows.jsm", scope);
    scope.mapwindows(function (win) {
      var label = win.document.getElementById('GRW-statusbar-label'),
          toolbarButton = win.document.getElementById('GRW-toolbar-label');

      if (counterEnabled && (val > 0 || showZeroCounter)) {
        showCounter(label, toolbarButton, showval);
      } else {
        hideCounter(label, toolbarButton);
      }
    });
  }
};
let EXPORTED_SYMBOLS = ['iconCounter'];
