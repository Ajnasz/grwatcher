/*jslint indent:2*/
/*global Components: true*/
var token = null;
var scope = {};
var getToken = function (callback) {
  Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
  Components.utils.import("resource://grwmodules/getter.jsm", scope);
  var cb = {
    onSuccess: function (response) {
      token = {
        token: response.responseText,
        date: new Date()
      };
      if (typeof callback === 'function') {
        callback(token);
      }
    },
    onError: function () {}
  };
  scope.getter.asyncRequest('get', scope.generateUri('www.google.com/reader/api/0/token'), cb);
};

let EXPORTED_SYMBOLS = ['getToken', 'token'];
