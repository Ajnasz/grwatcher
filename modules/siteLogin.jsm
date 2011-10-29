/*global Components: true*/
var scope = {};
Components.utils.import("resource://grwmodules/passManager.jsm", scope);
var siteLogin = function (callback) {
    Components.utils.import('resource://grwmodules/httpConnect.jsm', scope);

    var getAction = 'https://accounts.google.com/ServiceLogin?' +
          'service=reader&' +
          'continue=https://www.google.com/reader/view/&' +
          'followup=https://www.google.com/reader/view/',
        loginAction = 'https://accounts.google.com/ServiceLoginAuth',
        cb, postData;

    postData = ['Email=' + scope.passManager.getUsername(),
        'Passwd=' + scope.passManager.getPassword(),
        'service=reader',
        'continue=https://www.google.com/reader/view/',
        'folowup=https://www.google.com/reader/view/'];
    scope.httpGet(getAction, function (code, data) {
        Components.utils.import('resource://grwmodules/grwlog.jsm', scope);
        var galxMatch = data
            .match(/name="GALX"\s+value="([^"]+)"/),
            actionMatch;
        if (galxMatch) {
            postData.push('GALX=' + galxMatch[1]);
            actionMatch = data.match(/id="gaia_loginform"\s+action="([^"]+)"/);
            if (actionMatch) {
                loginAction = actionMatch[1];
            }
            scope.httpPost(loginAction, postData.join('&'), function (code, data) {
                callback();
            });
        } else {
            Components.utils.reportError('galxMatch failed');
        }
        /*
        scope.httpPost(action, postData, function (code, data) {
          Components.utils.import('resource://grwmodules/grwlog.jsm', scope);
          scope.grwlog('code: ' + code);
          scope.grwlog('data: ' + data);
        });
        */
    });

};

let EXPORTED_SYMBOLS = ['siteLogin'];

