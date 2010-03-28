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
    var _googlePW = null;
    /**
     * Get the already stored google login info
     * @method _getGooglePW
     * @private
     * @returns false if info not found, login data if found
     * @type nsiLoginInfo
     */
    var _getGooglePW = function() {
      if(_googlePW === null) {
        /**
         * list all of the login infos
         */
        /*
        var logins = loginManager.getAllLogins({});
        logins.forEach(function(l) {
          GRW.log(l.hostname, l.formSubmitURL, l.httpRealm, l.username, l.password, l.usernameField, l.passwordField);
        });
        */
        var logins = loginManager.findLogins({}, 'https://www.google.com', 'https://www.google.com', null);
        if(logins.length) {
          _googlePW = logins[0];
        } else {
          _googlePW = false;
        }
      }
      return _googlePW;
    };
    /**
     * method to get the user's password to login to google service
     * @method getPassword
     * @returns the password or false if it si not found
     * @type {String,Boolean}
     */
    this.getPassword = function() {
      try {
        var googlePW = _getGooglePW();
        if(googlePW) {
          return googlePW.password;
        }
        // Find users for the given parameters
        var logins = loginManager.findLogins({}, url, formSubmitURL, null);
        // Find user from returned array of nsILoginInfo objects
        for (var i = 0, ll = logins.length; i < ll; i++) {
          if (logins[i].username == username) {
            return logins[i].password;
          }
        }
        return false;
      }catch(ex){
        GRW.log('get pass failed:', ex);
      }
    };
    /**
     * Retreives the username
     * @method getUsername
     * @returns the username to log in to the google service
     * @type String
     */
    this.getUsername = function() {
        var googlePW = _getGooglePW();
        if(googlePW) {
          return googlePW.username;
        }
        return GRW.Prefs.get.userName();
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
  // GRW.log('passwordmanagaer');
})();
