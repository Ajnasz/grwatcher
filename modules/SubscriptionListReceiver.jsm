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
Components.utils.import("resource://grwmodules/ListReceiver.jsm", context);
context.listReceiverEvents.subscriptionGeneratedEvent = 'subscriptionGeneratedEvent';

/**
 * @class SubscriptionListReceiver
 * @constructor
 * @extends ListReceiver
 */
function SubscriptionListReceiver() {
    "use strict";
    this.url = clientConfig.subscriptionListURL;
}
SubscriptionListReceiver.prototype = new context.ListReceiver();
SubscriptionListReceiver.prototype.processSubscriptionList = function (subscriptions) {
    "use strict";
    this.fireEvent(context.listReceiverEvents.processStartEvent);

    var subscription;

    if (subscriptions && subscriptions.length > 0) {
        this.fireEvent(context.listReceiverEvents.subscriptionGeneratedEvent, subscriptions);
    }
};
SubscriptionListReceiver.prototype.success = function (response) {
    Components.utils.import("resource://grwmodules/JSON.jsm", context);
    this.processSubscriptionList(context.JSON.parse(response.responseText));
};

var EXPORTED_SYMBOLS = ['SubscriptionListReceiver'];
