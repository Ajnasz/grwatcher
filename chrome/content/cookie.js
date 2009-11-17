(function() {
  /**
   * @param {String} domain The cookie domain
   * @param {String} name The name of the cookie
   * @param {String} value The value of the cookie
   * @param {Date} [date] (optional) The expires date of the cookie
   * @param {String} [path] (optional) The path of the cookie
   */
  GRW.Cookie = {
    set: function(domain, name, value, date, path) {
      var cookieUri = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService)
                        .newURI('http://' + domain, null, null),

          cookieSvc = Components.classes["@mozilla.org/cookieService;1"]
                        .getService(Components.interfaces.nsICookieService),

          cookie = name + '=' + value + ';domain=' + domain;

      if(date instanceof Date) {
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        b = days[date.getUTCDay()] + ' ' + date.getUTCDate() + ' ' + months[date.getUTCMonth()] + ' ' + date.getUTCFullYear() + ' ' + date.getUTCHours() + ':' + date.getUTCMinutes() + ':' + date.getUTCSeconds() + ' UTC';
        cookie += ';expires=' + b;
      }
      cookie += path ? ';path=' + path : ';path=/';
      cookieSvc.setCookieString(cookieUri, null, cookie, null);
    },

    get: function(name, domain) {
      var cookieManager = Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager2),
          enumerator = cookieManager.enumerator;

      domain = domain || 'google.com';

      var rex = new RegExp(domain + '$'), cookie;
      while (enumerator.hasMoreElements()) {
        cookie = enumerator.getNext();
        if (cookie instanceof Components.interfaces.nsICookie) {
          if (rex.test(cookie.host)) {
            if(cookie.name == name) {
              return cookie.value;
            }
          }
        }
      }
      return false;
    }
  };
})();
