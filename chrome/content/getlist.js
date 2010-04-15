(function() {
  var loginManager = GRW.LoginManager,
      unreadcountURL = GRW.States.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      subscriptionListURL = GRW.States.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',

      // used for testing
      // unreadcountURL = 'http://localhost/grwatcher/hg/testfiles/unread-count.json?'+ (new Date().getTime()),
      // subscriptionListURL = 'http://localhost/grwatcher/hg/testfiles/feedlist.json?' + (new Date().getTime()),

      unreadGeneratedEvent = 'unreadGeneratedEvent',
      subscriptionGeneratedEvent = 'subscriptionGeneratedEvent',
      unreadAndSubscriptionReceivedEvent = 'unreadAndSubscriptionReceivedEvent',
      itemsMatchedEvent = 'itemsMatchedEvent',
      requestStartEvent = 'requestStartEvent',
      // requestFinishEvent = 'requestFinishEvent',
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
          this._initRequests();
          this._initialized = true;
        },
        restart: function() {
          this._initialized = false;
          this.start();
        },
        _fireUnreadAndSubscription: function() {
          if(this._subscriptionList && this._unreadCount) {
            this.fireEvent(unreadAndSubscriptionReceivedEvent, [this._subscriptionList, this._unreadCount]);
          } else if(this._subscriptionList) {
            this.getUnreadCount();
          } else if(this._unreadCount) {
            this.getSubscriptionList();
          }
        },
        _initRequests: function() {
          this.getSubscriptionList();
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
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(unreadCountRequestStartEvent);
          GRW.request('get', unreadcountURL, {
              onSuccess:function(o) {
                  _this.fireEvent(unreadCountRequestFinishEvent);
                  _this._processUnreadCount(o);
                },
                onError:function(o) {
                  _this.fireEvent(requestErrorEvent);
                }
          });
          /*
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
              */
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
          this._fireUnreadAndSubscription();
        },
        getSubscriptionList: function() {
          var _this = this;
          this.fireEvent(requestStartEvent);
          this.fireEvent(subscriptionListRequestStartEvent);
          GRW.request('get', subscriptionListURL, {
            onSuccess:function(o) {
              _this.fireEvent(subscriptionListRequestFinishEvent);
              _this._processSubscriptionList(o);
            },
            onError:function(o) {
              _this.fireEvent(requestErrorEvent);
            }
          });
          /*
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
              */
        },
        _matchUnreadItems: function(unreads) {
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
         * @method matchUnreadItems
         */
        matchUnreadItems: function() {
          this._unreadCount.httpFeeds = this._matchUnreadItems(this._unreadCount.httpFeeds);
          var unreads = this._unreadCount.httpFeeds.filter(function(elem) {
            return elem.count && parseInt(elem.count, 10) > 0;
          });
          unreads = this._filterLabels(unreads);
          var unreadSum = 0;
          unreads.forEach(function(elem) {
            unreadSum+=elem.count;
          });
          this._unreadCount.unreadSum = unreadSum;
          // var user_unreads = this._matchUnreadItems(this._unreadCount.userFeeds);
          // this.fireEvent(requestFinishEvent);
          this.fireEvent(processStartEvent);

          this.fireEvent(itemsMatchedEvent, [unreads, this._unreadCount.max]);
          this.fireEvent(processFinishEvent);
        },
      };
  GRW.augmentProto(getList, GRW.EventProvider);
  GRW.module('GetList', new getList);
})();
