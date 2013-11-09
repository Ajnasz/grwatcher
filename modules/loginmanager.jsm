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
var LoginManager = function () {
    var that = this;
    scope.oauth.on('loginSuccess', function () {
        that.loginSuccess();
    });
    scope.oauth.on('loginFailed', function (msg) {
        that.loginFailed(msg);
    });
};
LoginManager.authTypeOauth2 = 'Oauth2';
LoginManager.prototype = {
    oauthLogin: function (cb) {
        scope.oauth.getToken(cb);
    },
    getOauthToken: function (cb) {
        scope.oauth.getToken(cb);
    },
    loginSuccess: function () {
        this.fireEvent('loginSuccess');
    },
    loginFailed: function (msg) {
        this.fireEvent('loginFailed', msg);
    },
    getToken: function (cb) {
        this.getOauthToken(cb);
    },
    login: function (cb) {
        this.oauthLogin(cb);
    }
};

Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(LoginManager, scope.EventProvider);

var loginManager = new LoginManager();

let EXPORTED_SYMBOLS = ['loginManager', 'LoginManager'];
