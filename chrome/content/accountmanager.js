(function() {
  // mozilla nsi cookie manager component
      /**
       * Google account manager namespace,
       * check that the user is logged in,
       * logging in the user
       * @requires GRW.Prefs to get the preferences
       * @requires GRW._PasswordManager to get the users password
       * @requires #getFeedList function, to gets the feeds
       */
      var loginManager = {
        /**
         * Check, that the account is configured
         * @type {Boolean}
         */
        accountExists: function() {
          if(GRW.Prefs.get.userName() && GRW.PasswordManager.getPassword()) {
            return true;
          }
          return false;
        },
        /**
         * @return returns the value of the cookie named `SID`
         * @type {String,Boolean}
         */
        getCurrentSID: function() {
          return GRW.Cookie.get('SID');
        },
        isLoggedIn: function() {
          return this.getCurrentSID() != false;
        },
        setCurrentSID: function(response) {
          if(response && response.responseText) {
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
                GRW.Cookie.set('.google.com', 'SID', sid.split('=')[1], GRW.Prefs.get.rememberLogin());
                GRW.Token();
                return sid.split('=')[1];
              }
            }
          }
        },
        /**
         * do the login into the google service
         * @param {Function} onLoad run after successful login
         */
        logIn: function(onLogin) {
          if(this.accountExists()) {
            // var url = GRStates.conntype + '://www.google.com/accounts/ServiceLoginAuth';
            // var url = 'https://www.google.com/accounts/ServiceLoginAuth?service=reader';
            var url = 'https://www.google.com/accounts/ClientLogin?service=reader',
                param = 'service=reader&Email='+encodeURIComponent(GRW.Prefs.get.userName())+'&Passwd='+encodeURIComponent(GRW.PasswordManager.getPassword())+'&continue=http://www.google.com/reader/';
                _this = this;
            new GRW.Ajax({
              url: url,
              method: 'post',
              onSuccess: function(e) {
                GRW.log('login request success');
                loginManager.ajaxSuccess(e);
                if(GRW.lang.isFunction(onLogin)) {
                  onLogin.call();
                }
                if(!_this.getCurrentSID()) {
                  var cookieBehavior = GRW.Prefs.get.cookieBehaviour();
                  if(cookieBehavior != 0) {
                    loginManager.loginFailed(e.responseText);
                    GRW.log('bad cookie behavior', cookieBehavior);
                  } else {
                    loginManager.loginFailed(e.responseText);
                  }
                }
              }
            }, param).send();
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
          loginManager.setCurrentSID(e);
          var curSid = loginManager.getCurrentSID();
          if(curSid === false) {
            this.loginFailed(e.responseText);
            return false;
          }
          // GRW.Prefs.set.sid(curSid);
          return true;
        },
        /**
         * do things when the login failed
         * @returns false
         * @type Boolean
         */
        loginFailed: function(msg) {
          GRW.log('login failed');
          if(msg) {
            GRW.log(msg);
          }
          return false;
        },
      };

GRW.LoginManager = loginManager;
})();
