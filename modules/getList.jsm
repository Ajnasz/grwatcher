/*jslint indent: 2, nomen: true, sloppy: true*/
/*global Components: true, GRW: true*/

var context = {};
Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);
Components.utils.import("resource://grwmodules/grwlog.jsm", context);
Components.utils.import("resource://grwmodules/ListReceiver.jsm", context);
Components.utils.import("resource://grwmodules/UnreadCountReceiver.jsm", context);
Components.utils.import("resource://grwmodules/SubscriptionListReceiver.jsm", context);

var clientConfigs = {
    google: {
      unreadcountURL: ['www.google.com/reader/api/0/unread-count', {
        all: 'true',
        output: 'json'
      }],
      subscriptionListURL: ['www.google.com/reader/api/0/subscription/list', {output: 'json'}]
    },
    feedlySandox: {
      unreadcountURL: ['sandbox.feedly.com/v3/markers/counts', {
        autorefresh: 'true'
      }],
      subscriptionListURL: ['sandbox.feedly.com/v3/subscriptions']
    }
  },

  // used for testing
  // unreadcountURL =
  // 'http://localhost/grwatcher/hg/testfiles/unread-count.json?'+ (new
  // Date().getTime()),
  // subscriptionListURL =
  // 'http://localhost/grwatcher/hg/testfiles/feedlist.json?' + (new
  // Date().getTime()),

  unreadGeneratedEvent = context.listReceiverEvents.unreadGeneratedEvent,
  subscriptionGeneratedEvent = context.listReceiverEvents.subscriptionGeneratedEvent,
  unreadAndSubscriptionReceivedEvent = 'unreadAndSubscriptionReceivedEvent',
  itemsMatchedEvent = 'itemsMatchedEvent',

  unreadCountRequestStartEvent = 'unreadCountRequestStartEvent',
  processStartEvent = 'processStartEvent';

context.grwlog('unread generated event', unreadGeneratedEvent);

var clientConfig = clientConfigs.feedlySandox,
  getList,
  lastFeeds;


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

function createReceiver(Receiver, onSuccess, cont) {
  "use strict";
  var receiver = new Receiver();

  receiver.on(context.listReceiverEvents.requestStartEvent, function () {
    this.fireEvent(context.listReceiverEvents.requestStartEvent);
  }.bind(cont));

  receiver.on(context.listReceiverEvents.listProcessDoneEvent, function (items) {
    onSuccess(items);
    this._fireUnreadAndSubscription();
  }.bind(cont));

  receiver.on(context.listReceiverEvents.requestErrorEvent, function (response) {
    this.fireEvent(context.listReceiverEvents.requestErrorEvent);
  }.bind(cont));

  return receiver;
}

function GetList() {
  this.subscriptionList = createReceiver(context.SubscriptionListReceiver, function (items) {
    this._subscriptionList = {
      subscriptions: items
    };
  }.bind(this), this);

  this.unreadList = createReceiver(context.UnreadCountReceiver, function (items) {
    this._unreadCount = items;
  }.bind(this), this);
}
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

  restart: function () {
    this.setUnInitialized();
    this.start();
  },

  _fireUnreadAndSubscription: function () {
    if (this._subscriptionList && this._unreadCount) {
      this.matchUnreadItems();
      this.fireEvent(unreadAndSubscriptionReceivedEvent, [this._subscriptionList, this._unreadCount]);
    } else if (!this._unreadCount) {
      this.unreadList.request();
    } else if (!this._subscriptionList) {
      this.subscriptionList.request();
    }
  },

  _initRequests: function () {
    this._fireUnreadAndSubscription();
  },

  _subscriptionToHash: function (subscriptions) {
    var subscriptionHash = {},
      j = subscriptions.length - 1,
      subscription;

    subscriptions.forEach(function (s) {
      subscriptionHash[s.id] = s;
    });

    return subscriptionHash;
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
      subscriptionHash;

    subscriptionHash = this._subscriptionToHash(subscriptions);

    this._matchUnreadsWithHash(unreads, subscriptionHash);

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

    this.fireEvent(itemsMatchedEvent, [unreads, this._unreadCount.max]);
    this.setLastFeeds(this.matchedData.unreads);
  },

  setLastFeeds: function (feeds) {
    lastFeeds = feeds;
  },

  getLastFeeds: function (feeds) {
    return lastFeeds;
  }
};

context.augmentProto(GetList, context.EventProvider);

getList = new GetList();

var EXPORTED_SYMBOLS = ['getList'];
