/*jslint indent: 2*/
/*global Components*/
var clientConfigs = {
  google: {
    userinfoURI: ['www.google.com/reader/api/0/user-info']
  },
  feedlySandbox: {
    userinfoURI: ['sandbox.feedly.com/v3/profile']
  }
};
var clientConfig = clientConfigs.feedlySandbox;
var scope = {};
var userData = null;
var userInfo = {
  request: function (cb) {
    Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
    Components.utils.import("resource://grwmodules/request.jsm", scope);
    scope.request('get', scope.generateUri(clientConfig.userinfoURI, {ck: new Date().getTime()}), {
      onSuccess: function (o) {
        Components.utils.import("resource://grwmodules/JSON.jsm", scope);
        userData = scope.JSON.parse(o.responseText);
        cb(userData);
      },
      onError: function (o) {}
    });
  },
  get: function (callback) {
    //if (userData === null) {
    userInfo.request(callback);
    //} else {
    //  callback(userData);
    //}
  },
  set: function (ob) {
    if (typeof ob === 'object' && ob !== null) {
      userData = ob;
      return true;
    }
    return false;
  }
};

let EXPORTED_SYMBOLS = ['userInfo'];

// GRW.module('userInfo', userInfo);
