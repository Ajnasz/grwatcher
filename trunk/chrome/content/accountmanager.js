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
  CookieManager2: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2),
  /**
   * Check, that the account is configured
   * @type {Boolean}
   */
  accountExists: function() {
    if(GRPrefs.username() && passwordManager.getPassword()) {
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
      var url = GRPrefs.conntype + '://www.google.com/accounts/ClientLogin';
      var param = 'source=' + encodeURIComponent('Google Reader Watcher') + '&Email='+encodeURIComponent(GRPrefs.username())+'&Passwd='+encodeURIComponent(passwordManager.getPassword())+'&service=reader&continue=' + encodeURIComponent('http://www.google.com/');
      // remember the login state, possible won't ask for mozilla master password
      if(GRPrefs.rememberLogin()) {
        // param += '&PersistentCookie=yes';
      }
      var THIS = this;
      new Ajax({
        url: url,
        method: 'post',
        successHandler: function(event){THIS.ajaxSuccess(event, this.req);}
      }, param);
    } else {
      this.loginFailed();
      return -1;
    }
    return true;
  },
  setGoogleCookie: function(name, value) {
    this.CookieManager2.add('google.com', '/', name, value, false, GRPrefs.rememberLogin(), 1600000000);
  },
  /**
   * @param {Event} e event object
   * @returns true if the login was succes and false if wasn't
   * @type Boolean
   */
  ajaxSuccess: function(e, request) {
    var response = request.responseText;
    var rex = {
      sid: new RegExp('^SID=([-_a-zA-Z0-9]+)', 'm'),
      lsid: new RegExp('^LSID=([-_a-zA-Z0-9]+)', 'm'),
      auth: new RegExp('^Auth=([-_a-zA-Z0-9]+)', 'm')
    }
    var SID = response.replace(rex.sid, '$1');
    var LSID = response.replace(rex.lsid, '$1');
    var Auth = response.replace(rex.auth, '$1');
    GRW_LOG('SID: ' + SID, 'LSID: ' + LSID, 'Auth: ' + Auth);
    if(SID != '') {
      this.setGoogleCookie('SID', SID);
      if(LSID != '') {
        this.setGoogleCookie('LSID', LSID);
      }
      if(Auth != '') {
        this.setGoogleCookie('Auth', Auth);
      }
    }
    var curSid = accountManager.getCurrentSID();
    if(curSid === false) {
      GRW_StatusBar.switchErrorIcon();
      GRW_StatusBar.setReaderTooltip('loginerror');
      return false;
    } else {
      new GetList();
      return true;
    }
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
