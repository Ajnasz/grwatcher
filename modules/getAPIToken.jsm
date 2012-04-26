/*global Components: true*/
var scope = {};
var getAPIToken = function (callback) {
    Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
    Components.utils.import("resource://grwmodules/getter.jsm", scope);
    var cb = {
        onSuccess: function (response) {
            var tokenData = {
                token: response.responseText,
                date: new Date()
            };
            if (typeof callback === 'function') {
                callback(tokenData);
            }
        },
        onError: function () {}
    };
    scope.getter.asyncRequest('get', scope.generateUri('www.google.com/reader/api/0/token'), cb);
};

let EXPORTED_SYMBOLS = ['getAPIToken', 'token'];
