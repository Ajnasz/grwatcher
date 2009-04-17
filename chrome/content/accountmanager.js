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
GRWAccountManager = {
  // mozilla nsi cookie manager component
  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2),
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
              sid = new String(auths[i]);
              break;
            }
          }
          if(sid.length) {
            this.setCookie('SID', sid.split('=')[1], GRPrefs.getPref.rememberLogin());
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
              new GRW.GetList();
            }
          } else {
            var cookieBehavior = GRPrefs.getInt('network.cookie.cookieBehavior');
            if(cookieBehavior != 0) {
              _this.loginFailed(e.responseText);
              _this.badCookieBehavior();
              GRW.log('bad cookie behavior', cookieBehavior);
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
      this.loginFailed(e.responseText);
      return false;
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
    GRW.StatusBar.switchErrorIcon();
    GRW.StatusBar.setReaderTooltip('loginerror');
    GRW.log('login failed');
    if(msg) {
      GRW.log(msg);
    }
    return false;
  },
  badCookieBehavior: function() {
    document.getElementById('GRW-statusbar-menuitem-enablecookies').setAttribute('class', '');
  },
  goodCookieBehavior: function() {
    document.getElementById('GRW-statusbar-menuitem-enablecookies').setAttribute('class', 'grw-hidden');
  },
  setCookie: function(name, value, permanent) {
    if(permanent) {
      new GRW.Cookie('.google.com', name, value, new Date(new Date().setFullYear(new Date().getFullYear()+10)));
    } else {
      new GRW.Cookie('.google.com', name, value);
    }
  }
};
