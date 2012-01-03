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
Components.utils.import("resource://grwmodules/Oauth2.jsm", scope);
Components.utils.import("resource://grwmodules/ClientLogin.jsm", scope);
var LoginManager = function () {
    var that = this;
    scope.oauth.on('loginSuccess', function () {
        that.loginSuccess();
    });
    scope.oauth.on('loginFailed', function (msg) {
        that.loginFailed(msg);
    });
    scope.clientLogin.on('loginSuccess', function () {
        that.loginSuccess();
    });
    scope.clientLogin.on('loginFailed', function (msg) {
        that.loginFailed();
    });
    scope.clientLogin.on('cookieError', function (msg) {
        that.cookieError();
    });
};
LoginManager.authTypeClientLogin = 'ClientLogin';
LoginManager.authTypeOauth2 = 'Oauth2';
LoginManager.prototype = {
    oauthLogin: function (cb) {
        scope.oauth.getToken(cb);
    },
    clientLoginLogin: function (cb) {
        scope.clientLogin.logIn(cb);
    },
    loginSuccess: function () {
        this.fireEvent('loginSuccess');
    },
    loginFailed: function (msg) {
        this.fireEvent('loginFailed', msg);
    },
    cookieError: function () {
        this.fireEvent('cookieError');
    },
    getAuthType: function () {
        var output = 'ClientLogin';
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        if (scope.prefs.get.oauthCode()) {
            output = 'Oauth2';
        }
        return output;
    },
    login: function (cb) {
        switch (this.getAuthType()) {
        case LoginManager.authTypeOauth2:
            this.oauthLogin(cb);
            break;
        case LoginManager.authTypeClientLogin:
            this.clientLoginLogin(cb);
            break;
        }
    }
};

Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(LoginManager, scope.EventProvider);

var loginManager = new LoginManager();

let EXPORTED_SYMBOLS = ['loginManager', 'LoginManager'];
