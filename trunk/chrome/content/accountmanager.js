/**
 * accountmanager.js
 *
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @license GPL v2
 * for more details see the license.txt file
 */

/**
 * Google account manager namespace,
 * check that the user is logged in,
 * logging in the user
 * @requires GRPrefs to get the preferences
 * @requires _passwordManager to get the users password
 * @requires #getFeedList function, to gets the feeds
 */
var accountManager = {
  // mozilla nsi cookie manager component
  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
  /**
   * Check, that the account is configured
   * @type {Boolean}
   */
  accountExists: function() {
    if(GRPrefs.getPref.userName() && passwordManager.getPassword()) {
      return true;
    }
    return false;
  },
  /**
   * @return returns the value of the cookie named `SID`
   * @type {String,Boolean}
   */
  getCurrentSID: function() {
    var enumerator = this.CookieManager.enumerator;
    var rex = new RegExp('google.com$');
    while (enumerator.hasMoreElements()) {
      var cookie = enumerator.getNext();
      if (cookie instanceof Components.interfaces.nsICookie) {
        if (rex.test(cookie.host)) {
          if(cookie.name == 'SID' && cookie) {
            return true;
          }
        }
      }
    }
    return false;
  },
  /**
   * do the login into the google service
   */
  logIn: function() {
    if(this.accountExists()) {
      // var url = GRStates.conntype + '://www.google.com/accounts/ServiceLoginAuth';
      var url = 'https://www.google.com/accounts/ServiceLoginAuth';
      var param = 'Email='+encodeURIComponent(GRPrefs.getPref.userName())+'&Passwd='+encodeURIComponent(passwordManager.getPassword())+'&service=reader&continue=http://www.google.com';
      // remember the login state, possible won't ask for mozilla master password
      if(GRPrefs.getPref.rememberLogin()) {
        param += '&PersistentCookie=yes';
      }
      new Ajax({
        url: url,
        method: 'post',
        successHandler: this.ajaxSuccess
      }, param);
    } else {
      this.loginFailed();
      return -1;
    }
    return true;
  },
  /**
   * @param {Event} e event object
   * @returns true if the login was succes and false if wasn't
   * @type Boolean
   */
  ajaxSuccess: function(e) {
    var curSid = accountManager.getCurrentSID();
    if(curSid === false) {
      GRW_StatusBar.switchErrorIcon();
      GRW_StatusBar.setReaderTooltip('loginerror');
      return false;
    }
    new GetList();
    return true;
  },
  /**
   * do things when the login failed
   * @returns false
   * @type Boolean
   */
  loginFailed: function() {
    GRW_StatusBar.switchErrorIcon();
    GRW_LOG('login failed');
    return false;
  }
};
