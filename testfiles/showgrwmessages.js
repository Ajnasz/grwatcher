var a = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);var b = {};a.getMessageArray(b,{});var c = [];for(var i in b){for(var j in b[i]){if(/GRW/.test(b[i][j].message)){c.push(b[i][j].message);}}};a.logStringMessage('GRW messages: ' + c.join(" ====new message ==== "));