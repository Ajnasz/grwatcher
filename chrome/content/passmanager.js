(function() {
  var url = 'chrome://grwatcher',
      username = 'GoogleReaderWatcher',
    formSubmitURL = 'https://www.google.com',  // not http://www.example.com/foo/auth.cgi
      loginManager = Components.classes["@mozilla.org/login-manager;1"]
                      .getService(Components.interfaces.nsILoginManager),
    nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");

  /**
   * Interface to handle easily the user accounts on ff2 and ff3
   * @constructor
   * @class _PasswordManager
   * @namespace GRW
   */
  var _PasswordManager = function() {
    this.getPassword = function() {
      try {
        // Find users for the given parameters
        var logins = loginManager.findLogins({}, url, formSubmitURL, null);
        // Find user from returned array of nsILoginInfo objects
        for (var i = 0, ll = logins.length; i < ll; i++) {
          if (logins[i].username == username) {
            return logins[i].password;
          }
        }
        return false;
      }
      catch(ex){
      GRW.log('get pass failed:', ex);
      }
    };

    this.addPassword = function(password) {
      try {
        var logins = loginManager.findLogins({}, url, formSubmitURL, null);
        // Find user from returned array of nsILoginInfo objects
        for (var i = 0; i < logins.length; i++) {
          if (logins[i].username == username) {
            loginManager.removeLogin(logins[i]);
          }
        }
        var extLoginInfo = new nsLoginInfo(url, formSubmitURL, null, username, password, "", "");
        loginManager.addLogin(extLoginInfo);
      } catch(ex) {
        GRW.log(ex);
      }

    }
  };
  GRW.PasswordManager = new _PasswordManager();
  GRW.log('passwordmanagaer');
})();
