(function() {
  var userinfoURI = ['www.google.com/reader/api/0/user-info'];
  var userData = {};
  var userInfo = {
    request: function() {
      GRW.request('get', GRW.uri(userinfoURI, {ck: new Date().getTime()}), {
        onSuccess: function(o) {
          GRW.log(o.responseText);
          var userData = GRW.JSON.parse(o.responseText);
        },
        onError: function(o) {},
      });
    },
    get: function() {
      return userData;
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
