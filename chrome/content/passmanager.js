/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license GPL v2
 * for more details see the license.txt
 */

/**
 * @constructor
 * @class _passwordManager Interface to handle easily the user accounts on ff2 and ff3
 */
var _GRWPasswordManager = function() {
  this.url = 'chrome://grwatcher';
  this.username = 'GoogleReaderWatcher';

  try { // Firefox 3
    this.loginManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager) || Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManager),
    this.nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Components.interfaces.nsILoginInfo, "init");

    this.formSubmitURL = 'https://www.google.com';  // not http://www.example.com/foo/auth.cgi

    this.getPassword = function() {
      try {
        // Find users for the given parameters
        var logins = this.loginManager.findLogins({}, this.url, this.formSubmitURL, null);
        // Find user from returned array of nsILoginInfo objects
        for (var i = 0, ll = logins.length; i < ll; i++) {
          if (logins[i].username == this.username) {
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
        var logins = this.loginManager.findLogins({}, this.url, this.formSubmitURL, null);
        // Find user from returned array of nsILoginInfo objects
        for (var i = 0; i < logins.length; i++) {
          if (logins[i].username == this.username) {
            this.loginManager.removeLogin(logins[i]);
          }
        }
        var extLoginInfo = new this.nsLoginInfo(this.url, this.formSubmitURL, null, this.username, password, "", "");
        this.loginManager.addLogin(extLoginInfo);
      } catch(ex) {
        GRW.log(ex);
      }

    }
  }
  catch(e) { // Firefox 2
    // mozilla nsi password manager component
    this.passwordManager = Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManager);

    this.getPassword = function() {
      // the host name of the password we are looking for
      // ask the password manager for an enumerator:
      var e = this.passwordManager.enumerator;
      // step through each password in the password manager until we find the one we want:
      while (e.hasMoreElements()) {
        try {
          // get an nsIPassword object out of the password manager.
          // This contains the actual password...
          var pass = e.getNext().QueryInterface(Components.interfaces.nsIPassword);
          if (pass.host == this.url && pass.user == this.username) {
            return pass.password
          }
        } catch (ex){
          GRW.log(ex);
        }
      }
    },
    /**
     * @param {String} password password for the google reader account
     */
    this.addPassword = function(password) {
      try {
        this.passwordManager.removeUser(this.url, this.username);
      }
      catch (ex) {
        GRW.log(ex);
      }
      try {
        this.passwordManager.addUser(this.url, this.username, password);
      } catch(ex) {
        GRW.log(ex);
      }
    }
  }
};
