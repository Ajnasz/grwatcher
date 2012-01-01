var authURL = 'https://accounts.google.com/o/oauth2/auth';
var clientID = '18154408674.apps.googleusercontent.com';
var clientSecret = '7uN4ujGfnbItwS6NbqWgbEJ5';

var scope = {};

var Oauth2 = function Oauth2() {
};
Oauth2.prototype = {
    saveAuthCode: function (value) {
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        return scope.prefs.set.oauthCode(value);
    },
    auth: function () {
        var queryParams, data;
        queryParams = [
            {
                name: 'response_type',
                value: 'code'
            },
            {
                name: 'client_id',
                value: clientID
            },
            {
                name: 'redirect_uri',
                value: 'urn:ietf:wg:oauth:2.0:oob'
            },
            {
                name: 'scope',
                value: ['https://www.google.com/reader/api/0/subscription/list', 'https://www.google.com/reader/api/0/friend/list', 'https://www.google.com/reader/api/0/unread-count'].join(' ')
            },
            {
                name: 'state',
                value: null
            }
        ];

        data = queryParams.map(function (param) {
            if (typeof param.value === 'string') {
                return encodeURIComponent(param.name) + '=' + encodeURIComponent(param.value);
            }
        }).join('&');

        Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
        scope.grwlog(authURL + '?' + data);
        var win = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                          .getService(Components.interfaces.nsIWindowWatcher)
          .openWindow(null, authURL + '?' + data, "GRWatcher Auth request",
                      "location=yes,status=yes,width=500,height=410", null);

        Components.utils.import("resource://grwmodules/timer.jsm", scope);
        var that = this;
        var later = function () {
          scope.later(function () {
              var title = win.document.title;
              if (title.indexOf('Success code=') > -1) {
                  that.saveAuthCode(title.split('code=')[1]);
                  win.close();
                  scope.grwlog('oauthcode saved');
              } else {
                  scope.grwlog(win.document.title);
                  if (win && !win.closed) {
                      later();
                  }
              }
          }, 1000);
        };
        later();
    }
};

var EXPORTED_SYMBOLS = ['Oauth2'];
