/*jslint indent: 2*/
/*global Components: true */
// mozilla nsi cookie manager component
/**
  * Google account manager namespace,
  * check that the user is logged in,
  * logging in the user
  * @requires GRW._PasswordManager to get the users password
  * @requires #getFeedList function, to gets the feeds
  */
var scope = {};
var LoginManager = function () {};
LoginManager.prototype = {
  /**
    * Check, that the account is configured
    * @type {Boolean}
    */
  accountExists: function () {
    Components.utils.import("resource://grwmodules/PassManager.jsm", scope);
    if (scope.PassManager.getUsername() && scope.PassManager.getPassword()) {
      return true;
    }
    return false;
  },
  isLoggedIn: function () {
    return this.getCurrentAuth() !== false;
  },
  hasSidInCookie: function () {
    Components.utils.import("resource://grwmodules/GrwCookie.jsm", scope);
    return scope.GrwCookie.get('SID');
  },
  getCurrentSID: function () {
    return this.authData !== null && typeof this.authData === 'object' ?
            this.authData.SID : false;
  },
  getCurrentAuth: function () {
    return this.authData !== null && typeof this.authData === 'object' ?
            this.authData.Auth : false;
  },
  parseResponse: function (response) {
    if (response && response.responseText) {
      var auths = response.responseText.split('\n'),
          authData = {};
      auths.forEach(function (item) {
        var itemKeyValue = item.split('=');
        if (itemKeyValue.length === 2) {
          authData[itemKeyValue[0]] = itemKeyValue[1];
        }
      });
      if (authData.Auth) {
        this.authData = authData;
      } else {
        this.authData = null;
      }
      return this.authData;
    }
  },

  handleWrongResponse: function (response) {
    Components.utils.import("resource://grwmodules/Prefs.jsm", scope);
    var cookieBehavior = scope.Prefs.get.cookieBehaviour(),
        _this = this;

    if (cookieBehavior !== 0) {

      _this.loginFailed(response.responseText);
      _this.fireEvent('cookieError');

      Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
      scope.grwlog('bad cookie behavior', cookieBehavior);

    } else {
      _this.loginFailed(response.responseText);
    }
  },

  /**
    * do the login into the google service
    * @param {Function} onLoad run after successful login
    */
  logIn: function (onLogin) {
    if (this.accountExists()) {
      // var url = GRStates.conntype + '://www.google.com/accounts/ServiceLoginAuth';
      // var url = 'https://www.google.com/accounts/ServiceLoginAuth?service=reader';
      Components.utils.import("resource://grwmodules/PassManager.jsm", scope);

      var param = 'service=reader&Email=' + encodeURIComponent(scope.PassManager.getUsername()) +
          '&Passwd=' + encodeURIComponent(scope.PassManager.getPassword()) +
          '&continue=http://www.google.com/reader/',
          _this = this, url, cb;

      Components.utils.import("resource://grwmodules/generateUri.jsm", scope);

      url = scope.generateUri('www.google.com/accounts/ClientLogin', {service: 'reader'});

      cb = {
        onSuccess: function (response) {
          // logoin success
          _this.loginSuccess(response);
          if (typeof onLogin === 'function') {
            onLogin.call(this, response);
          }
          if (!_this.getCurrentAuth()) {
            _this.handleWrongResponse(response);
          }
        },
        onError: function (response) {
          _this.loginFailed(response.responseText);
        }
      };

      Components.utils.import("resource://grwmodules/getter.jsm", scope);

      scope.getter.asyncRequest('post', url, cb, param);

    } else {
      this.loginFailed('account not defined');
      return -1;
    }
    return true;
  },
  /**
    * @param {Event} e event object
    * @returns true if the login was succes and false if wasn't
    * @type Boolean
    */
  loginSuccess: function (e) {
    this.parseResponse(e);
    var curAuth = this.getCurrentAuth(e);

    if (curAuth === false) {
      this.loginFailed(e.responseText);
      return false;
    } else {
      Components.utils.import("resource://grwmodules/getter.jsm", scope);
      scope.getter.setDefaultHeader({
        name: 'Authorization',
        value: 'GoogleLogin auth=' + curAuth
      });
    }
    this.fireEvent('loginSuccess');
    return true;
  },
  /**
    * do things when the login failed
    * @returns false
    * @type Boolean
    */
  loginFailed: function (msg) {
    this.fireEvent('loginFailed', msg);
    return false;
  }
};

Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(LoginManager, scope.EventProvider);

var loginManager = new LoginManager();

let EXPORTED_SYMBOLS = ['loginManager'];
