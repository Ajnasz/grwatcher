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
 * @requires _GRWPasswordManager to get the users password
 * @requires #getFeedList function, to gets the feeds
 */
var GRWAccountManager = {
  // mozilla nsi cookie manager component
  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
  /**
   * Check, that the account is configured
   * @type {Boolean}
   */
  accountExists: function() {
    if(GRPrefs.getPref.userName() && GRWPasswordManager.getPassword()) {
      return true;
    }
    return false;
  },
  /**
   * @return returns the value of the cookie named `SID`
   * @type {String,Boolean}
   */
  getCurrentSID: function(response) {
    var enumerator = this.CookieManager.enumerator;
    var rex = new RegExp('google.com$');
    while (enumerator.hasMoreElements()) {
      var cookie = enumerator.getNext();
      if (cookie instanceof Components.interfaces.nsICookie) {
        if (rex.test(cookie.host)) {
          if(cookie && cookie.name == 'SID') {
            return cookie.value;
          }
        }
      }
    }
    if(response) {
      if(response.responseText) {
        var auths = response.responseText.split('\n');
        if(auths.length) {
          var sid = '';
          for (var i = 0; i < auths.length; i++) {
            if(/^SID/.test(auths[i])) {
              sid = auths[i];
              break;
            }
          }
          if(sid.length) {
            var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
            var cookieUri = ios.newURI("http://www.google.com/", null, null);
            var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);

            cookieSvc.setCookieString(cookieUri, null, sid, null);
            return sid.split('=')[1];
          }
        }
      }

    }
    
    return false;
  },
  /**
   * do the login into the google service
   * @param {Function} onLoad run after successful login
   * @param {Boolean} [noGetList] if true, won't send a request after a successfull login
   */
  logIn: function(onLogin, noGetList) {
    if(this.accountExists()) {
      // var url = GRStates.conntype + '://www.google.com/accounts/ServiceLoginAuth';
      // var url = 'https://www.google.com/accounts/ServiceLoginAuth?service=reader';
      var url = 'https://www.google.com/accounts/ClientLogin?service=reader';
      var param = 'service=reader&Email='+encodeURIComponent(GRPrefs.getPref.userName())+'&Passwd='+encodeURIComponent(GRWPasswordManager.getPassword())+'&continue=http://www.google.com/reader/';
      // remember the login state, possible won't ask for mozilla master password
      if(GRPrefs.getPref.rememberLogin()) {
        param += '&PersistentCookie=yes';
      }
      var _this = this;
      new Ajax({
        url: url,
        method: 'post',
        successHandler: function(e) {
          _this.goodCookieBehavior();
          _this.ajaxSuccess(e);
          if(typeof onLogin == 'function') {
            onLogin();
          }
          if(_this.getCurrentSID()) {
            if(!noGetList) {
              new GetList();
            }
          } else {
            var cookieBehavior = GRPrefs.getInt('network.cookie.cookieBehavior');
            if(cookieBehavior != 0) {
              _this.loginFailed(e.responseText);
              _this.badCookieBehavior();
              GRW_LOG('bad cookie behavior', cookieBehavior);
            } else {
              _this.loginFailed(e.responseText);
            }
          }
        }
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
    var curSid = GRWAccountManager.getCurrentSID(e);
    if(curSid === false) {
      s = e.responseText.match(/SID=(.+)/);
      curSid = e[1];
      if(curSid) {
      } else {
        GRW_StatusBar.switchErrorIcon();
        GRW_StatusBar.setReaderTooltip('loginerror');
        return false;
      }
    }
    GRPrefs.setPref.sid(curSid);
    return true;
  },
  /**
   * do things when the login failed
   * @returns false
   * @type Boolean
   */
  loginFailed: function(msg) {
    GRW_StatusBar.switchErrorIcon();
    GRW_LOG('login failed');
    if(msg) {
      GRW_LOG(msg);
    }
    return false;
  },
  badCookieBehavior: function() {
    document.getElementById('GRW-statusbar-menuitem-enablecookies').setAttribute('class', '');
  },
  goodCookieBehavior: function() {
    document.getElementById('GRW-statusbar-menuitem-enablecookies').setAttribute('class', 'grw-hidden');
  }
};
