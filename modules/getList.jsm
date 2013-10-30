/*jslint indent: 2, nomen: true, sloppy: true*/
/*global Components: true, GRW: true*/
var clientConfigs = {
    google: {
      unreadcountURL: ['www.google.com/reader/api/0/unread-count', {
        all: 'true',
        output: 'json'
      }],
      subscriptionListURL: ['www.google.com/reader/api/0/subscription/list', {output: 'json'}],
      friendListURL: ['www.google.com/reader/api/0/friend/list', {output: 'json'}]
    },
    feedlySandox: {
      unreadcountURL: ['sandbox.feedly.com/v3/markers/counts', {
        autorefresh: 'true'
      }],
      subscriptionListURL: ['sandbox.feedly.com/v3/subscriptions'],
      friendListURL: ['www.google.com/reader/api/0/friend/list', {output: 'json'}]
    }
  },

  // used for testing
  // unreadcountURL =
  // 'http://localhost/grwatcher/hg/testfiles/unread-count.json?'+ (new
  // Date().getTime()),
  // subscriptionListURL =
  // 'http://localhost/grwatcher/hg/testfiles/feedlist.json?' + (new
  // Date().getTime()),

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

var scope = {},
  clientConfig = clientConfigs.feedlySandox,
  GetList,
  getList,
  lastFeeds;

Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
GetList = function () {
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
GetList.prototype = {
  initialized: false,
  setInitialized: function () {
      this.initialized = true;
  },
  setUnInitialized: function () {
      this.initialized = false;
  },
  isInitialized: function () {
      return this.initialized;
  },
  start: function () {
    if (this.isInitialized()) {
      return;
    }
    this._initRequests();
    this.setInitialized();
  },
  getUserInfo: function (cb) {
    var _this = this;
    Components.utils.import("resource://grwmodules/userinfo.jsm", scope);
    scope.userInfo.get(function (info) {
      _this.userInfo = info;
      if (typeof cb === 'function') {
        cb(info);
      }
    });
  },
  restart: function () {
    this.setUnInitialized();
    this.start();
  },
  _fireUnreadAndSubscription: function () {
    if (this._subscriptionList && this._unreadCount/* && this._friendList */) {
      this.matchUnreadItems();
      this.fireEvent(unreadAndSubscriptionReceivedEvent,
        [this._subscriptionList, this._unreadCount, this._friendList]);
    } else if (!this._unreadCount) {
      this.getUnreadCount();
    } else if (!this._subscriptionList) {
      this.getSubscriptionList();
    } else if (!this._friendList) {
      this.getFriendList();
    }
  },
  _initRequests: function () {
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
  _processUnreadCount: function (response) {
    "use strict";
    this.fireEvent(processStartEvent);
    Components.utils.import("resource://grwmodules/JSON.jsm", scope);
    var text = response.responseText,
        obj = scope.JSON.parse(text),
        unreadcounts = obj.unreadcounts,
        i = unreadcounts.length - 1,
        unreadSum,
        unread,
        labels = [],
        feeds  = [],
        unreadItem;

    while (i >= 0) {
      unreadItem = unreadcounts[i];
      if (this.isLabelItem(unreadItem)) {
        labels.push(unreadItem);
      } else if (this.isReadingListCounter(unreadItem)) {
        unreadSum = unreadItem.count;
      } else if (!this.isBroadcastFriendCount(unreadItem)) {
        feeds.push(unreadItem);
      }
      i -= 1;
    }

    unread = {
      max: obj.max, // max number to display
      // unread items number unreadItems: unreadcounts, // all of the unread items
      unreadSum: unreadSum,
      // unread items, but only the ones which are belongs to a url (id
      // starts with doesn't start with 'user')
      labels: labels,
      // unread items, but only the ones which are belongs to the user (id
      // starts with 'user')
      feeds: feeds
    };
    this._unreadCount = unread;
    this.fireEvent(unreadGeneratedEvent, this._unreadCount);
    this.fireEvent(processFinishEvent);
  },
  getUnreadCount: function () {
    var _this = this;
    this.fireEvent(requestStartEvent);
    this.fireEvent(unreadCountRequestStartEvent);
    Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
    Components.utils.import("resource://grwmodules/request.jsm", scope);
    scope.request('get', scope.generateUri.apply(scope.generateUri, clientConfig.unreadcountURL), {
      onSuccess: function (o) {
          _this.fireEvent(unreadCountRequestFinishEvent);
          if (!_this.userInfo) {
            _this.getUserInfo(function (info) {
              _this._processUnreadCount(o);
            });
          } else {
            _this._processUnreadCount(o);
          }
        },
        onError: function (o) {
          _this.fireEvent(requestErrorEvent);
        }
    });
  },
  _processSubscriptionList: function (subscriptions) {
    this.fireEvent(processStartEvent);
    // this.fireEvent(requestFinishEvent);

    var subscription;

    if (subscriptions && subscriptions.length > 0) {
      subscription = {
        subscriptions: subscriptions
      };
      this._subscriptionList = subscription;
      this.fireEvent(subscriptionGeneratedEvent, subscription);
    }
    this.fireEvent(processFinishEvent);
  },
  getSubscriptionList: function () {
    var _this = this;
    this.fireEvent(requestStartEvent);
    this.fireEvent(subscriptionListRequestStartEvent);
    Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
    Components.utils.import("resource://grwmodules/request.jsm", scope);
    scope.request('get', scope.generateUri.apply(scope.generateUri, clientConfig.subscriptionListURL), {
      onSuccess: function (o) {
        Components.utils.import("resource://grwmodules/JSON.jsm", scope);
        _this.fireEvent(subscriptionListRequestFinishEvent);
        _this._processSubscriptionList(scope.JSON.parse(o.responseText));
      },
      onError: function (o) {
        _this.fireEvent(requestErrorEvent);
      }
    });
  },
  _processFriendList: function (friends) {
    this.fireEvent(processStartEvent);
    // this.fireEvent(requestFinishEvent);

    Components.utils.import("resource://grwmodules/JSON.jsm", scope);
    var friend = {
        friends: friends
      };
    this._friendList = friend;
    this.fireEvent(friendGeneratedEvent, friend);
    this.fireEvent(processFinishEvent);
  },
  getFriendList: function () {
    var _this = this;
    this.fireEvent(requestStartEvent);
    this.fireEvent(friendListRequestStartEvent);
    Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
    Components.utils.import("resource://grwmodules/request.jsm", scope);
    scope.request('get', scope.generateUri.apply(scope.generateUri, clientConfig.friendListURL), {
      onSuccess: function (o) {
        Components.utils.import("resource://grwmodules/JSON.jsm", scope);
        _this.fireEvent(friendListRequestFinishEvent);
        _this._processFriendList(scope.JSON.parse(o.responseText));
      },
      onError: function (o) {
        _this.fireEvent(requestErrorEvent);
      }
    });
  },
  _matchUnreadItems: function (unreads) {
    var subscriptions = this._subscriptionList.subscriptions,
        friends = [] /*this._friendList.friends*/,

        i = unreads.length - 1,
        j = subscriptions.length - 1,
        k = friends.length - 1,
        subscriptionHash = {},
        friendHash = {},
        unread,
        subscription,
        friend;

    while (j >= 0) {
      subscription = subscriptions[j];
      subscriptionHash[subscription.id] = subscription;
      j -= 1;
    }
    while (k >= 0) {
      friend = friends[k];
      friendHash[friend.stream] = friend;
      k -= 1;
    }

    while (i >= 0) {
      unread = unreads[i];
      subscription = subscriptionHash[unread.id];
      if (subscription) {
        unread.data = subscription;
      } else {
        friend = friendHash[unread.id];
        if (friend) {
          unread.data = friend;
        }
      }
      i -= 1;
    }
    return unreads;
  },
  _filterLabels: function (items) {

    Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    var filteredLabels = scope.prefs.get.filteredLabels()
          .replace(/\s+,/g, ',').replace(/,\s+/g, ','),
          _isFilteredLabel, _isNotFilteredLabel;

    if (filteredLabels !== '') {
      filteredLabels = filteredLabels.split(',');

      _isFilteredLabel = function (item) {
        var categories = item.data.categories;
        if (categories.length) {
          return filteredLabels.some(function (label) {
            return categories.some(function (category) {
              return label === category.label;
            });
          });
        } else {
          return filteredLabels.some(function (label) {
            return label === '-';
          });
        }
      };

      _isNotFilteredLabel = function (item) {
        var categories = item.data.categories;

        if (categories.length) {
          return filteredLabels.every(function (label) {
            return categories.every(function (category) {
              return label !== category.label;
            });
          });
        } else {
          return filteredLabels.every(function (label) {
            return label !== '-';
          });
        }
      };

      return items.filter(_isNotFilteredLabel);

    }
    return items;
  },
  _filterZeroCounts: function (items) {
    return items.filter(function (item) {
      return item.count && parseInt(item.count, 10) > 0 && item.data;
    });
  },
  getLabels: function () {
    var labels = {},
        subscriptionsList, subscription;
    if (this._subscriptionLis && this._subscriptionList.subscriptions) {
      subscriptionsList = this._subscriptionList.subscriptions;

      subscriptionsList.forEach(function (item) {
        if (item.categories.length) {
          item.categories.forEach(function (category) {
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
  matchUnreadItems: function () {
    this._unreadCount.feeds = this._matchUnreadItems(this._unreadCount.feeds);
    var unreads = this._filterZeroCounts(this._unreadCount.feeds),
        unreadSum = 0;
    unreads = this._filterLabels(unreads);

    unreads.forEach(function (elem) {
      unreadSum += elem.count;
    });

    scope.grwlog('unread sum: ', unreadSum);

    this._unreadCount.unreadSum = unreadSum;
    this.matchedData = {
      unreads: unreads,
      max: this._unreadCount.max
    };
    this.fireEvent(processStartEvent);

    this.fireEvent(itemsMatchedEvent, [unreads, this._unreadCount.max]);
    this.fireEvent(processFinishEvent);
    this.setLastFeeds(this.matchedData.unreads);
  },
  setLastFeeds: function (feeds) {
    lastFeeds = feeds;
  },
  getLastFeeds: function (feeds) {
    return lastFeeds;
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(GetList, scope.EventProvider);


getList = new GetList();

let EXPORTED_SYMBOLS = ['getList'];
