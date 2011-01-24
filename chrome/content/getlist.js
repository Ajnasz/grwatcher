(function() {
  const loginManager = GRW.LoginManager,
      unreadcountURL = ['www.google.com/reader/api/0/unread-count', {
        all:'true',
        output:'json'
      }],
      subscriptionListURL = ['www.google.com/reader/api/0/subscription/list', {output:'json'}],
      friendListURL = ['www.google.com/reader/api/0/friend/list', {output: 'json'}],

      // used for testing
      // unreadcountURL = 'http://localhost/grwatcher/hg/testfiles/unread-count.json?'+ (new Date().getTime()),
      // subscriptionListURL = 'http://localhost/grwatcher/hg/testfiles/feedlist.json?' + (new Date().getTime()),

      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      friendGeneratedEvent = 'friendGeneratedEvent',
      unreadAndSubscriptionReceivedEvent = 'unreadAndSubscriptionReceivedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent',
      requestStartEvent = 'requestStartEvent',
      // requestFinishEvent = 'requestFinishEvent',
      requestErrorEvent = 'requestErrorEvent',

      unreadCountRequestStartEvent = 'unreadCountRequestStartEvent',
      unreadCountRequestFinishEvent = 'unreadCountRequestFinishEvent',
      subscriptionListRequestStartEvent = 'subscriptionListRequestStartEvent',
      subscriptionListRequestFinishEvent = 'subscriptionListRequestFinishEvent',
      friendListRequestStartEvent = 'friendListRequestStartEvent',
      friendListRequestFinishEvent = 'friendListRequestFinishEvent',
      processStartEvent = 'processStartEvent',
      processFinishEvent = 'processFinishEvent';


      var getList = function() {
        var _this = this;
        this.subscribe(subscriptionGeneratedEvent, function () {
          _this._fireUnreadAndSubscription();
        });
        this.subscribe(friendGeneratedEvent, function () {
          _this._fireUnreadAndSubscription();
        });
        this.subscribe(unreadGeneratedEvent, function () {
          _this._fireUnreadAndSubscription();
        });
      };
      getList.prototype = {
        start: function() {
          if(this._initialized) return;
          var _this = this;
          GRW.userInfo.get(function (info) {
            _this.userInfo = info;
            _this._initRequests();
            _this._initialized = true;
          });
        },
        restart: function() {
          this._initialized = false;
          this.start();
        },
        _fireUnreadAndSubscription: function() {
          if(this._subscriptionList && this._unreadCount && this._friendList) {
            this.fireEvent(unreadAndSubscriptionReceivedEvent, [this._subscriptionList, this._unreadCount, this._friendList]);
          } else if(!this._unreadCount) {
            this.getUnreadCount();
          } else if(!this._subscriptionList) {
            this.getSubscriptionList();
          } else if(!this._friendList) {
            this.getFriendList();
          }
        },
        _initRequests: function() {
          this.getSubscriptionList();
        },
        isLabelItem: function (item) {
          return item.id.indexOf('user/' + this.userInfo.userId + '/label') === 0;
        },
        isFollwedUser: function (item) {
          return /user\/\d+\/state\/com.google\/google/.test(item.id);
        },
        isReadingListCounter: function (item) {
          return item.id.indexOf('/state/com.google/reading-list') !== -1;
        },
        isBroadcastFriendCount: function (item) {
          return item.id.indexOf('/state/com.google/broadcast-friend') !== -1;
        },
        isBroadcastCount: function (item) {
          return item.id.indexOf('/state/com.google/broadcast') !== -1;
        },
        _processUnreadCount: function(response, userInfo) {
          this.fireEvent(processStartEvent);
          var text = response.responseText,
              obj = GRW.JSON.parse(text),
              unreadcounts = obj.unreadcounts,
              i = unreadcounts.length - 1,
              unreadSum,
              unread,
              labels = [],
              feeds  = [],
              unreadItem;

          while(i >= 0) {
            unreadItem = unreadcounts[i];
            if(this.isLabelItem(unreadItem)) {
              labels.push(unreadItem)
            } else if(this.isReadingListCounter(unreadItem)) {
              unreadSum = unreadItem.count;
            } else if(!this.isBroadcastFriendCount(unreadItem)) {
              feeds.push(unreadItem);
            }
            i--;
          }

          unread = {
            rText: text, // response text
            rJSON: obj,  // response text as json object
            max: obj.max, // max number to display
            unreadSum: unreadSum, // unread items number unreadItems: unreadcounts, // all of the unread items
            labels: labels, // unread items, but only the ones which are belongs to a url (id starts with doesn't start with 'user')
            feeds: feeds // unread items, but only the ones which are belongs to the user (id starts with 'user')
          };
          this._unreadCount = unread;
          this.fireEvent(unreadGeneratedEvent, this._unreadCount);
          this.fireEvent(processFinishEvent);
        },
        getUnreadCount: function() {
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(unreadCountRequestStartEvent);
          Components.utils.import("resource://grwmodules/GRWUri.jsm");
          GRW.request('get', GRWUri.apply(GRWUri, unreadcountURL), {
              onSuccess:function(o) {
                  _this.fireEvent(unreadCountRequestFinishEvent);
                  _this._processUnreadCount(o);
                },
                onError:function(o) {
                  _this.fireEvent(requestErrorEvent);
                }
          });
        },
        _processSubscriptionList: function(response) {
          this.fireEvent(processStartEvent);
          // this.fireEvent(requestFinishEvent);

          var obj = GRW.JSON.parse(response.responseText),
              subscription = {
                rText: response.responseText,
                rJSON: obj,
                subscriptions: obj.subscriptions
              };
          this._subscriptionList = subscription;
          this.fireEvent(subscriptionGeneratedEvent, subscription);
          this.fireEvent(processFinishEvent);
        },
        getSubscriptionList: function() {
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(subscriptionListRequestStartEvent);
          Components.utils.import("resource://grwmodules/GRWUri.jsm");
          GRW.request('get', GRWUri.apply(GRWUri, subscriptionListURL), {
            onSuccess:function(o) {
              _this.fireEvent(subscriptionListRequestFinishEvent);
              _this._processSubscriptionList(o);
            },
            onError:function(o) {
              _this.fireEvent(requestErrorEvent);
            }
          });
        },
        _processFriendList: function(response) {
          this.fireEvent(processStartEvent);
          // this.fireEvent(requestFinishEvent);

          var obj = GRW.JSON.parse(response.responseText),
              friend = {
                rText: response.responseText,
                rJSON: obj,
                friends: obj.friends
              };
          this._friendList = friend;
          this.fireEvent(friendGeneratedEvent, friend);
          this.fireEvent(processFinishEvent);
        },
        getFriendList: function () {
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(friendListRequestStartEvent);
          Components.utils.import("resource://grwmodules/GRWUri.jsm");
          GRW.request('get', GRWUri.apply(GRWUri, friendListURL), {
            onSuccess:function(o) {
              _this.fireEvent(friendListRequestFinishEvent);
              _this._processFriendList(o);
            },
            onError:function(o) {
              _this.fireEvent(requestErrorEvent);
            }
          });
        },
        _matchUnreadItems: function(unreads) {
          var subscriptions = this._subscriptionList.subscriptions,
              friends = this._friendList.friends,

              i = unreads.length - 1,
              j = subscriptions.length - 1,
              k = friends.length - 1,
              subscriptionHash = {},
              friendHash = {},
              unread,
              subscription,
              friend;

          while(j >= 0) {
            subscription = subscriptions[j];
            subscriptionHash[subscription.id] = subscription;
            j--;
          }
          while(k >= 0) {
            friend = friends[k];
            friendHash[friend.stream] = friend;
            k--;
          }

          while(i >= 0) {
            unread = unreads[i];
            subscription = subscriptionHash[unread.id];
            if(subscription) {
              unread.data = subscription;
            } else {
              // GRW.log(unread.id, friendHash[unread.id]);
              // GRW.log(friendHash.toSource());
              friend = friendHash[unread.id];
              if (friend) {
                unread.data = friend;
              }
            }
            i--;
          }
          return unreads;
        },
        _filterLabels: function(items) {

          var filteredLabels = GRW.Prefs.get.filteredLabels().replace(/\s+,/g, ',').replace(/,\s+/g, ',');

          if (filteredLabels !== '') {
            filteredLabels = filteredLabels.split(',');

            var _isFilteredLabel = function(item) {
              var categories = item.data.categories;
              if(categories.length) {
                return filteredLabels.some(function(label) {
                  return categories.some(function(category) {
                    return label == category.label;
                  });
                });
              } else {
                return filteredLabels.some(function(label) {
                  return label == '-';
                });
              }
            };

            var _isNotFilteredLabel = function(item) {
              var categories = item.data.categories;

              if(categories.length) {
                return filteredLabels.every(function(label) {
                  return categories.every(function(category) {
                    return label != category.label;
                  });
                });
              } else {
                return filteredLabels.every(function(label) {
                  return label != '-';
                });
              }
            };

            return items.filter(_isNotFilteredLabel);

          }
          return items;
        },
        getLabels: function() {
            var labels = {},
                subscriptionsList;
          if (this._subscriptionLis && this._subscriptionList.subscriptions) {
            subscriptions = this._subscriptionList.subscriptions;

            subscriptionsList.forEach(function(item) {
              if(item.categories.length) {
                item.categories.forEach(function(category) {
                  labels[item.id] = category.label;
                });
              }
            });
          }
          return labels;
        },
        /**
         * @method matchUnreadItems
         */
        matchUnreadItems: function() {
          this._unreadCount.feeds = this._matchUnreadItems(this._unreadCount.feeds);
          var unreads = this._unreadCount.feeds.filter(function(elem) {
            // GRW.log('feeds filter: ', parseInt( elem.count, 10))
            return elem.count && parseInt(elem.count, 10) > 0;
          });
          unreads = this._filterLabels(unreads);
          var unreadSum = 0;
          unreads.forEach(function(elem) {
            // GRW.log(elem.count, elem.id);
            unreadSum += elem.count;
          });
          this._unreadCount.unreadSum = unreadSum;
          this.fireEvent(processStartEvent);

          this.fireEvent(itemsMatchedEvent, [unreads, this._unreadCount.max]);
          this.fireEvent(processFinishEvent);
        },
      };
  GRW.augmentProto(getList, GRW.EventProvider);
  GRW.module('GetList', new getList);
})();
