var context = {};
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
};
var clientConfig = clientConfigs.feedlySandox;
var matchers = {
    isReadingListCounter: function (item) {
        "use strict";
        return item.id.indexOf('/state/com.google/reading-list') !== -1;
    },

    isBroadcastFriendCount: function (item) {
        "use strict";
        return item.id.indexOf('/state/com.google/broadcast-friend') !== -1;
    }
};

Components.utils.import("resource://grwmodules/ListReceiver.jsm", context);

context.listReceiverEvents.unreadGeneratedEvent = 'unreadGeneratedEvent';


/**
 * @class UnreadCountReceiver
 * @constructor
 * @extends ListReceiver
 */
function UnreadCountReceiver() {
    "use strict";
    this.url = clientConfig.unreadcountURL;
}
UnreadCountReceiver.prototype = new context.ListReceiver();
UnreadCountReceiver.prototype.isLabelItem = function (item) {
    "use strict";
    return item.id.indexOf('user/' + this.userInfo.userId + '/label') === 0;
};

UnreadCountReceiver.prototype.processUnreadCount = function (obj) {
    "use strict";
    this.fireEvent(context.listReceiverEvents.processStartEvent);

    var unreadcounts = obj.unreadcounts,
        i = unreadcounts.length - 1,
        unreadSum,
        unread,
        labels = [],
        feeds = [],
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

    this.fireEvent(context.listReceiverEvents.unreadGeneratedEvent, unread);
    this.fireEvent(context.listReceiverEvents.processFinishEvent);
};
UnreadCountReceiver.prototype.success = function (response) {
    "use strict";
    Components.utils.import("resource://grwmodules/JSON.jsm", context);
    if (!this.userInfo) {
        Components.utils.import("resource://grwmodules/userinfo.jsm", context);
        context.userInfo.get(function (info) {
            this.userInfo = info;
            this.processUnreadCount(context.JSON.parse(response.responseText));
        }.bind(this));
    } else {
        this.processUnreadCount(context.JSON.parse(response.responseText));
    }
};

var EXPORTED_SYMBOLS = ['UnreadCountReceiver'];
