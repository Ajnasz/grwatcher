(function() {
  var loginManager = GRW.LoginManager,
      unreadcountURL = GRStates.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      subscriptionListURL = GRStates.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',

      json = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON),

      getList = function() {
        this.init.apply(this);
      };
      getList.prototype = {
        init: function() {
          var _this = this,

              firstRequest = function() {
                GRW.Token(_this._initRequests, _this, true);
              };
          if(loginManager.isLoggedIn()) {
            firstRequest();
          } else {
              loginManager.logIn(firstRequest);
          }
        },
        _initRequests: function() {
          this.getUnreadCount();
          this.getSubscriptionList();
        },
        _processUnreadCount: function(response) {
          var text = response.responseText,
              obj = JSON.parse(text);
          this._unreadCount = {
            rText: text,
            rJSON: obj,
            max: obj.max
          };
        },
        getUnreadCount: function() {
          var _this,
              req = new GRW.Ajax({
                url: unreadcountURL,
                onSuccess:function(o) {
                  _this._processUnreadCount(o);
                }
              }).send();
        },
        _processSubscriptionList: function(response) {
          this._subscriptionList = {
            rText: o.responseText,
            rJSON: json.decode(o.responseText)
          };
        },
        getSubscriptionList: function() {
          var _this,
              req = new GRW.Ajax({
                url: subscriptionListURL,
                onSuccess:function(o) {
                  _this._processSubscriptionList(o);
                }
              }).send();
        }
      };
  GRW.GetList = getList;
})();
