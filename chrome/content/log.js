/**
 * Logger method which writes messages to the error console
 * @method log
 *
 * @namespace GRW
 *
 * @param {String} message log on the javascript console
 */
GRW.log = function() {
  var msg = new Array();
  for(var i = 0; i < arguments.length; i++) {
    msg.push(arguments[i]);
  }
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage('GRW: ' + msg.join(',\n'));
};
