(function() {
      var lastResponse;
  // mozilla nsi cookie manager component
      /**
       * Google account manager namespace,
       * check that the user is logged in,
       * logging in the user
       * @requires GRW.Prefs to get the preferences
       * @requires GRW._PasswordManager to get the users password
       * @requires #getFeedList function, to gets the feeds
       */
      var loginManager = function() {};
      loginManager.prototype = {
        /**
         * Check, that the account is configured
         * @type {Boolean}
         */
        accountExists: function() {
          if(GRW.PasswordManager.getUsername() && GRW.PasswordManager.getPassword()) {
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
          return this.getCurrentAuth() != false;
        },
        setCurrentSID: function() {
          if(lastResponse && lastResponse.responseText) {
            var auths = lastResponse.responseText.split('\n');
            if(auths.length) {
              var sid = '';
              for (var i = 0; i < auths.length; i++) {
                if(/^SID/.test(auths[i])) {
                  sid = new String(auths[i]);
                  break;
                }
              }
              if(sid.length) {
                GRW.Cookie.set('google.com', 'SID', sid.split('=')[1], GRW.Prefs.get.rememberLogin());
                // GRW.Token();
                return sid.split('=')[1];
              }
            }
          }
        },
        getCurrentAuth: function() {
          return this.Auth;
        },
        setCurrentAuth: function() {
          if(lastResponse && lastResponse.responseText) {
            var auths = lastResponse.responseText.split('\n');
            if(auths.length) {
              var auth = '';
              for (var i = 0; i < auths.length; i++) {
                if(/^Auth/.test(auths[i])) {
                  auth = new String(auths[i]);
                  break;
                }
              }
              if(auth.length) {
                var authVal = auth.split('=')[1];
                this.Auth = authVal;
                // GRW.Token();
                return authVal;
              } else {
                this.Auth = false;
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
                param = 'service=reader&Email='+encodeURIComponent(GRW.PasswordManager.getUsername())+'&Passwd='+encodeURIComponent(GRW.PasswordManager.getPassword())+'&continue=http://www.google.com/reader/';
                _this = this;
            GRW.request('post', url, {
              onSuccess: function(e) {
                _this.loginSuccess(e);
                if(GRW.lang.isFunction(onLogin)) {
                  onLogin.call();
                }
                if(!_this.getCurrentAuth()) {
                  var cookieBehavior = GRW.Prefs.get.cookieBehaviour();
                  if(cookieBehavior != 0) {
                    _this.loginFailed(e.responseText);
                    _this.fireEvent('cookieError');
                    GRW.log('bad cookie behavior', cookieBehavior);
                  } else {
                    _this.loginFailed(e.responseText);
                  }
                }
              },
              onError: function(e) {
                _this.loginFailed(e.responseText);
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
        loginSuccess: function(e) {
          lastResponse = e;
          this.setCurrentAuth(e);
          // var curSid = this.getCurrentSID();
          // if(curSid === false) {
          //   this.loginFailed(e.responseText);
          //   return false;
          // }
          // GRW.Prefs.set.sid(curSid);
          var curAuth =this.getCurrentAuth(e);

          if(curAuth === false) {
            this.loginFailed(e.responseText);
            return false;
          } else {
            this.setCurrentSID(e);
            GRW.getter.setDefaultHeader({
              name: 'Authorization',
              value: 'GoogleLogin auth=' + curAuth
            })
          }
          this.fireEvent('loginSuccess');
          return true;
        },
        /**
         * do things when the login failed
         * @returns false
         * @type Boolean
         */
        loginFailed: function(msg) {
          GRW.log('login failed');
          this.fireEvent('loginFailed');
          return false;
        },
      };

  GRW.augmentProto(loginManager, GRW.EventProvider);
  GRW.module('LoginManager', new loginManager());
})();
