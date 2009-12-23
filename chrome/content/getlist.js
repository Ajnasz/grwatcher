(function() {
  var loginManager = GRW.LoginManager,
      unreadcountURL = GRW.States.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      subscriptionListURL = GRW.States.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',


      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      unreadAndSubscriptionReceivedEvent = 'unreadAndSubscriptionReceivedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent',
      requestStartEvent = 'requestStartEvent',
      requestFinishEvent = 'requestFinishEvent',
      requestErrorEvent = 'requestErrorEvent',

      unreadCountRequestStartEvent = 'unreadCountRequestStartEvent',
      unreadCountRequestFinishEvent = 'unreadCountRequestFinishEvent',
      subscriptionListRequestStartEvent = 'subscriptionListRequestStartEvent',
      subscriptionListRequestFinishEvent = 'subscriptionListRequestFinishEvent',
      processStartEvent = 'processStartEvent',
      processFinishEvent = 'processFinishEvent',


      getList = function() {};
      getList.prototype = {
        start: function() {
          if(this._initialized) return;
          var _this = this;

          var firstRequest = function() {
            _this.fireEvent(requestStartEvent);
            GRW.Token({
              success: {
                fn: _this._initRequests,
                scope: _this
              },
              failure: {
                fn: function() {
                  this.fireEvent(requestErrorEvent);
                },
                scope: _this
                
              }
            }, _this, true);
          };

          if(loginManager.isLoggedIn()) {
            firstRequest();
          } else {
            loginManager.logIn(firstRequest);
          }
          this._initialized = true;
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
          this.fireEvent(processStartEvent);
          var text = response.responseText,
              obj = GRW.JSON.parse(text),
              unreadcounts = obj.unreadcounts,
              i = unreadcounts.length - 1,
              unreadSum,
              unread,
              userFeeds = [],
              httpFeeds  = [],
              unreadItem;

          while(i >= 0) {
            unreadItem = unreadcounts[i];
            if(unreadItem.id.indexOf('user') == 0) {
              userFeeds.push(unreadItem)
              if(unreadItem.id.indexOf('/state/com.google/reading-list') != -1) {
                unreadSum = unreadItem.count;
              }
            } else {
              httpFeeds.push(unreadItem);
            }
            i--;
          }

          unread = {
            rText: text, // response text
            rJSON: obj,  // response text as json object
            max: obj.max, // max number to display
            unreadSum: unreadSum, // unread items number unreadItems: unreadcounts, // all of the unread items
            userFeeds: userFeeds, // unread items, but only the ones which are belongs to a url (id starts with doesn't start with 'user')
            httpFeeds: httpFeeds // unread items, but only the ones which are belongs to the user (id starts with 'user')
          };
          this._unreadCount = unread;
          this.fireEvent(unreadGeneratedEvent, this._unreadCount);
          this.fireEvent(processFinishEvent);
          this._fireUnreadAndSubscription();
        },
        getUnreadCount: function() {
          if(!loginManager.isLoggedIn()) {
            GRW.log('not logged in');
            this.start();
            return;
          }
          if(!this._subscriptionList) {
            this.getSubscriptionList();
          }
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(unreadCountRequestStartEvent);
          var req = new GRW.Ajax({
                url: unreadcountURL,
                onSuccess:function(o) {
                  _this.fireEvent(unreadCountRequestFinishEvent);
                  _this._processUnreadCount(o);
                },
                onError:function(o) {
                  _this.fireEvent(requestErrorEvent);
                }
              }).send();
        },
        _processSubscriptionList: function(response) {
          this.fireEvent(processStartEvent);
          this.fireEvent(requestFinishEvent);

          var obj = GRW.JSON.parse(response.responseText),
              subscription = {
                rText: response.responseText,
                rJSON: obj,
                subscriptions: obj.subscriptions
              };
          this._subscriptionList = subscription;
          this.fireEvent(subscriptionGeneratedEvent, subscription);
          this.fireEvent(processFinishEvent);
          this._fireUnreadAndSubscription();
        },
        getSubscriptionList: function() {
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(subscriptionListRequestStartEvent);
          var req = new GRW.Ajax({
                url: subscriptionListURL,
                onSuccess:function(o) {
                  _this.fireEvent(subscriptionListRequestFinishEvent);
                  _this._processSubscriptionList(o);
                },
                onError:function(o) {
                  _this.fireEvent(requestErrorEvent);
                }
              }).send();
        },
        _matchUnreadItems: function(unreads) {
          GRW.log('unreads: ', unreads.toSource());
          var subscriptions = this._subscriptionList.subscriptions,

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
          return unreads;
        },
        _filterLabels: function(items) {

          var filteredLabels = GRW.Prefs.get.filteredLabels().replace(/(^\s+|\s$|,\s+|\s+,)/g, '');

          if (filteredLabels !== '') {
            filteredLabels = filteredLabels.split(',');

            var _isFilteredLabel = function(item) {
              var categories = item.data.categories;

              return filteredLabels.some(function(label) {
                return categories.some(function(category) {
                  return label == category.label;
                });
              });
            };

            var _isNotFilteredLabel = function(item) {
              var categories = item.data.categories;

              return filteredLabels.every(function(label) {
                return categories.every(function(category) {
                  return label != category.label;
                });
              });
            };

            return items.filter(_isNotFilteredLabel);

          }
          return items;
        },
        getLabels: function() {
          var labels = {},
              subscriptionsList = this._subscriptionList.subscriptions;

          subscriptionsList.forEach(function(item) {
            if(item.categories.length) {
              item.categories.forEach(function(category) {
                labels[item.id] = category.label;
              });
            }
          });
          return labels;
        },
        /**
         * @param {String} which Which items should be matched. Possible values are:
         *  <ul>
         *  <li>http</li>
         *  <li>user</li>
         *  <li>all</li>
         *  </ul>
         *
         */
        matchUnreadItems: function(which) {
          var unreads = this._matchUnreadItems(this._unreadCount.httpFeeds);
          unreads = this._filterLabels(unreads);
          var user_unreads = this._matchUnreadItems(this._unreadCount.userFeeds);
          this.fireEvent(requestFinishEvent);
          this.fireEvent(processStartEvent);

          this.fireEvent(itemsMatchedEvent, unreads);
          this.fireEvent(processFinishEvent);
        },
      };
  GRW.augmentProto(getList, GRW.EventProvider);
  GRW.module('GetList', new getList);
})();
