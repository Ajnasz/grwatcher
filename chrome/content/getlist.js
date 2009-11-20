(function() {
  var loginManager = GRW.LoginManager,
      unreadcountURL = GRW.States.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      subscriptionListURL = GRW.States.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',

      json = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON),

      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      unreadAndSubscriptionReceivedEvent = 'unreadAndSubscriptionReceivedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent',

      getList = function() {
        this.init.apply(this);
      };
      getList.prototype = {
        start: function() {
          if(this._initialized) return;
          var _this = this;

          var firstRequest = function() {
            GRW.Token(_this._initRequests, _this, true);
          };

          if(loginManager.isLoggedIn()) {
            firstRequest();
          } else {
            loginManager.logIn(firstRequest);
          }
          this._initialized = true;
        },
        init: function() {
        },
        _fireUnreadAndSubscription: function() {
          if(this._subscriptionList && this._unreadCount) {
            this.fireEvent(unreadAndSubscriptionReceivedEvent, [this._subscriptionList, this._unreadCount]);
          }
        },
        _initRequests: function() {
          this.getSubscriptionList();
          this.getUnreadCount();
        },
        _processUnreadCount: function(response) {
          var text = response.responseText,
              obj = JSON.parse(text),
              z = 0,
              unreadcounts = obj.unreadcounts,
              i = unreadcounts.length - 1,
              unread,
              userFeeds = [],
              httpFeeds  = [],
              unreadItem;

          while(i >= 0) {
            unreadItem = unreadcounts[i];
            z += unreadItem.count;
            (unreadItem.id.indexOf('user') == 0) ? userFeeds.push(unreadItem) : httpFeeds.push(unreadItem);
            i--;
          }

          unread = {
            rText: text,
            rJSON: obj,
            max: obj.max,
            unreadSum: z,
            unreadItems: unreadcounts,
            userFeeds: userFeeds,
            httpFeeds: httpFeeds
          };
          this._unreadCount = unread;
          this.fireEvent(unreadGeneratedEvent, unread);
          this._fireUnreadAndSubscription();
        },
        getUnreadCount: function() {
          var _this = this;
          var req = new GRW.Ajax({
                url: unreadcountURL,
                onSuccess:function(o) {
                  _this._processUnreadCount(o);
                }
              }).send();
        },
        _processSubscriptionList: function(response) {
          var obj = JSON.parse(response.responseText),
              subscription = {
                rText: response.responseText,
                rJSON: obj,
                subscriptions: obj.subscriptions
              };
          this._subscriptionList = subscription;
          this.fireEvent(subscriptionGeneratedEvent, subscription);
          this._fireUnreadAndSubscription();
        },
        getSubscriptionList: function() {
          var _this = this;
          var req = new GRW.Ajax({
                url: subscriptionListURL,
                onSuccess:function(o) {
                  _this._processSubscriptionList(o);
                }
              }).send();
        },
        matchUnreadItems: function() {
          var unreads = this._unreadCount.httpFeeds,
              subscriptions = this._subscriptionList.subscriptions,

              i = unreads.length - 1,
              j = subscriptions.length - 1,
              subscriptionHash = {},
              unread,
              subscription;

          while(j >= 0) {
            subscription = subscriptions[j];
            subscriptionHash[subscription.id] = subscription;
            j--;
          }

          while(i >= 0) {
            unread = unreads[i];
            subscription = subscriptionHash[unread.id];
            if(subscription) {
              unread.data = subscription;
            }
            i--;
          }
          this.fireEvent(itemsMatchedEvent, unread);
        },
      };
  GRW.augmentProto(getList, GRW.EventProvider);
  GRW.GetList = getList;
})();
