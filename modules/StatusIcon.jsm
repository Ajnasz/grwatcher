
var srv =Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
var getClass = function (status) {
  var output;
  switch(status.toString()) {

    case 'on':
      output = 'on';
      break;

    case 'error':
    case 'cookieerror':
      output = 'error';
      break;

    case 'load':
      output = 'load';
      break;

    case 'off':
    default:
      output = 'off';
      break;
  }
  return output;
};
var StatusIcon = function(iconId, status) {

  Components.utils.import("resource://grwmodules/mapwindows.jsm");
  mapwindows(function(win) {

    var statusImage = win.document.getElementById(iconId),
        classes;
    if(!statusImage) {
      return;
    }
    classes = statusImage.getAttribute('class');
    classes = classes.replace(/ on| off| error| load/g, '');
    classes += ' ' + getClass(status);
    statusImage.setAttribute('class', classes);
  });
};

let EXPORTED_SYMBOLS = ['StatusIcon'];
