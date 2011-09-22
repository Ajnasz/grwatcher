var scope = {};
/**
  * Logger method which writes messages to the error console
  * @method log
  *
  * @param {String} message log on the javascript console
  */
var grwlog =  function () {
  Components.utils.import("resource://grwmodules/prefs.jsm", scope);
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  if (scope.prefs.get.debug()) {
    var msg = [];
    for(let i = 0, al = arguments.length, arg, message; i< al; i++) {
      arg = arguments[i];
      if(arg instanceof Error) {
        message = [];
        message.push('aaa');
        for(let j in arg) {
          //if(arg.hasOwnProperty(j)) {
            message.push(j + ' = ' + arg[j]);
          //}
        }
        message = message.join('\n');
      } else {
        message = arg;
      }
      msg.push(arg);
    }
    consoleService.logStringMessage('GRW: ' + msg.join(',\n'));
  }
};
let EXPORTED_SYMBOLS = ['grwlog'];
