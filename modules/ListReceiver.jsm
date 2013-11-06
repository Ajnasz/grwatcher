var context = {};
Components.utils.import("resource://grwmodules/augment.jsm", context);
Components.utils.import("resource://grwmodules/EventProvider.jsm", context);

var boo = 1;

var listReceiverEvents = {
    requestErrorEvent: 'requestErrorEvent',
    requestStartEvent: 'requestStartEvent',
    listProcessDoneEvent: 'listProcessDoneEvent'
};
function ListReceiver() {
    "use strict";
}
ListReceiver.prototype = {
    url: null,
    success: function () {
        "use strict";
        throw new Error('Success must be overwritten');
    },
    error: function () {
        "use strict";
        this.fireEvent(listReceiverEvents.requestErrorEvent);
    },
    request: function () {
        "use strict";
        this.fireEvent(listReceiverEvents.requestStartEvent);
        Components.utils.import("resource://grwmodules/generateUri.jsm", context);
        Components.utils.import("resource://grwmodules/request.jsm", context);
        context.request(
            'get',
            context.generateUri.apply(context.generateUri, this.url),
            {
                onSuccess: this.success.bind(this),
                onError: this.error.bind(this)
            }
        );
    }
};
context.augmentProto(ListReceiver, context.EventProvider);

var EXPORTED_SYMBOLS = ['ListReceiver', 'listReceiverEvents'];
