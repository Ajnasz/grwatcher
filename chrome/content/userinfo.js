(function() {
  const userinfoURI = ['www.google.com/reader/api/0/user-info'];
  var userData = null;
  var userInfo = {
    request: function(cb) {
      Components.utils.import("resource://grwmodules/generateUri.jsm");
      GRW.request('get', generateUri(userinfoURI, {ck: new Date().getTime()}), {
        onSuccess: function(o) {
          Components.utils.import("resource://grwmodules/JSON.jsm");
          userData = JSON.parse(o.responseText);
          cb(userData);
        },
        onError: function(o) {},
      });
    },
    get: function(callback) {
      if (userData === null) {
        userInfo.request(callback);
      } else {
        callback(userData);
      }
    },
    set: function(ob) {
      if(GRW.isObject(ob)) {
        userData = ob;
        return true;
      }
      return false;
    },
  };
  GRW.module('userInfo', userInfo);
})();
