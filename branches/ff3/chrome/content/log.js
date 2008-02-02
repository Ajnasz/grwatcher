/**
 * @param {String} message log on the javascript console
 */
LOG = function(msg)
{
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage('GRW: ' + msg);
};
