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

var context = {},
  clientConfig = clientConfigs.feedlySandox,
  GetList,
  getList,
  lastFeeds;

Components.utils.import("resource://grwmodules/grwlog.jsm", context);


function filterMatchingLabels(filteredLabels, categories) {
  return filteredLabels.some(function (label) {
    return categories.some(function (category) {
      return label === category.label;
    });
  });
}

function filterNonMatchingLabels(filteredLabels, categories) {
  return filteredLabels.every(function (label) {
    return categories.every(function (category) {
      return label !== category.label;
    });
  });
}

function isNotFilteredLabel(filteredLabels) {
  return function (item) {
    var categories = item.data.categories,
      output;

    if (categories.length) {
      output = filterNonMatchingLabels(filteredLabels, categories);
    } else {
      output = filteredLabels.every(function (label) {
        return label !== '-';
      });
    }

    return output;
  };
}

function isFilteredLabel(filteredLabels) {
  return function (item) {
    var categories = item.data.categories,
      output;

    if (categories.length) {
      output = filterMatchingLabels(filteredLabels, categories);
    } else {
      output = filteredLabels.some(function (label) {
        return label === '-';
      });
    }

    return output;
  };
}
function filterZeroCounts(items) {
  return items.filter(function (item) {
    return item.count && parseInt(item.count, 10) > 0 && item.data;
  });
}

function filterLabels(items) {
  Components.utils.import("resource://grwmodules/prefs.jsm", context);

  var filteredLabels = context.prefs.get.filteredLabels()
        .replace(/\s+,/g, ',').replace(/,\s+/g, ',');

  if (filteredLabels !== '') {
    filteredLabels = filteredLabels.split(',');

    return items.filter(isNotFilteredLabel(filteredLabels));

  }
  return items;
}

var matchers = {
  isBroadcastCount: function (item) {
    return item.id.indexOf('/state/com.google/broadcast') !== -1;
  },
  isBroadcastFriendCount: function (item) {
    return item.id.indexOf('/state/com.google/broadcast-friend') !== -1;
  },
  isReadingListCounter: function (item) {
    return item.id.indexOf('/state/com.google/reading-list') !== -1;
  },
  isFollwedUser: function (item) {
    return (/user\/\d+\/state\/com\.google\/google/).test(item.id);
  }
};

GetList = function () {
  var cb = this._fireUnreadAndSubscription.bind(this);
  this.subscribe(subscriptionGeneratedEvent, cb);
  this.subscribe(friendGeneratedEvent, cb);
  this.subscribe(unreadGeneratedEvent, cb);
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
    Components.utils.import("resource://grwmodules/userinfo.jsm", context);
    context.userInfo.get(function (info) {
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
    if (this._subscriptionList && this._unreadCount) {
      this.matchUnreadItems();
      this.fireEvent(unreadAndSubscriptionReceivedEvent, [this._subscriptionList, this._unreadCount]);
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

  _processUnreadCount: function (response) {
    "use strict";
    this.fireEvent(processStartEvent);

    Components.utils.import("resource://grwmodules/JSON.jsm", context);

    var text = response.responseText,
      obj = context.JSON.parse(text),
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
      } else if (matchers.isReadingListCounter(unreadItem)) {
        unreadSum = unreadItem.count;
      } else if (!matchers.isBroadcastFriendCount(unreadItem)) {
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

  onUnreadCountSuccess: function (response) {
    this.fireEvent(unreadCountRequestFinishEvent);

    if (!this.userInfo) {
      this.getUserInfo(function (info) {
        this._processUnreadCount(response);
      }.bind(this));
    } else {
      this._processUnreadCount(response);
    }
  },

  onUnreadCountError: function () {
    this.fireEvent(requestErrorEvent);
  },

  getUnreadCountRequestUrl: function () {
    Components.utils.import("resource://grwmodules/generateUri.jsm", context);
    Components.utils.import("resource://grwmodules/request.jsm", context);

    return context.generateUri.apply(context.generateUri, clientConfig.unreadcountURL);
  },

  getUnreadCount: function () {
    this.fireEvent(requestStartEvent);
    this.fireEvent(unreadCountRequestStartEvent);

    context.request('get', this.getUnreadCountRequestUrl(), {
      onSuccess: this.onUnreadCountSuccess.bind(this),
      onError: this.onUnreadCountError.bind(this)
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
    Components.utils.import("resource://grwmodules/generateUri.jsm", context);
    Components.utils.import("resource://grwmodules/request.jsm", context);
    context.request('get', context.generateUri.apply(context.generateUri, clientConfig.subscriptionListURL), {
      onSuccess: function (o) {
        Components.utils.import("resource://grwmodules/JSON.jsm", context);
        _this.fireEvent(subscriptionListRequestFinishEvent);
        _this._processSubscriptionList(context.JSON.parse(o.responseText));
      },
      onError: function (o) {
        _this.fireEvent(requestErrorEvent);
      }
    });
  },

  _processFriendList: function (friends) {
    this.fireEvent(processStartEvent);
    // this.fireEvent(requestFinishEvent);

    var friend = {
      friends: friends
    };

    this._friendList = friend;
    this.fireEvent(friendGeneratedEvent, friend);
    this.fireEvent(processFinishEvent);
  },
  onFriendListSuccess: function (response) {
    Components.utils.import("resource://grwmodules/JSON.jsm", context);

    this._processFriendList(context.JSON.parse(response.responseText));
    this.fireEvent(friendListRequestFinishEvent);
  },
  onFriendListError: function (response) {
    this.fireEvent(requestErrorEvent);
  },
  getFriendList: function () {
    Components.utils.import("resource://grwmodules/generateUri.jsm", context);
    Components.utils.import("resource://grwmodules/request.jsm", context);

    var _this = this;

    this.fireEvent(requestStartEvent);
    this.fireEvent(friendListRequestStartEvent);

    context.request('get', context.generateUri.apply(context.generateUri, clientConfig.friendListURL), {
      onSuccess: this.onFriendListSuccess.bind(this),
      onError: this.onFriendListError.bind(this)
    });
  },

  _subscriptionToHash: function (subscriptions) {
    var subscriptionHash = {},
      j = subscriptions.length - 1,
      subscription;

    while (j >= 0) {
      subscription = subscriptions[j];
      subscriptionHash[subscription.id] = subscription;
      j -= 1;
    }

    return subscriptionHash;
  },

  _friendsToHash: function (friends) {
    var friendHash = {},
      k = friends.length - 1,
      friend;

    while (k >= 0) {
      friend = friends[k];
      friendHash[friend.stream] = friend;
      k -= 1;
    }

    return friendHash;
  },

  _matchUnreadsWithHash: function (unreads, hash) {
    unreads.forEach(function (unread) {
      var item = hash[unread.id];

      if (item) {
        unread.data = item;
      }
    });
  },

  _matchUnreadItems: function (unreads) {
    var subscriptions = this._subscriptionList.subscriptions,
      // friends = [], /*this._friendList.friends*/
      subscriptionHash;

    subscriptionHash = this._subscriptionToHash(subscriptions);
    // friendHash = this._friendsToHash(friends);

    this._matchUnreadsWithHash(unreads, subscriptionHash);
    // this._matchUnreadsWithHash(unreads, friendHash);

    return unreads;
  },

  getLabels: function () {
    var labels = {},
      subscriptionsList,
      subscription;

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
    var unreads = filterZeroCounts(this._unreadCount.feeds),
      unreadSum;

    unreads = filterLabels(unreads);

    unreadSum = unreads.reduce(function (prev, elem) {
      return prev + elem.count;
    }, 0);

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

Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);

context.augmentProto(GetList, context.EventProvider);

getList = new GetList();

var EXPORTED_SYMBOLS = ['getList'];
