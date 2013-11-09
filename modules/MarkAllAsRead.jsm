/*global Components:true*/
var scope = {};
Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
Components.utils.import("resource://grwmodules/request.jsm", scope);
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/stringBundles.jsm", scope);
Components.utils.import("resource://grwmodules/userinfo.jsm", scope);
var clientConfigs = {
    google: {
        markAsReadUrl: 'www.google.com/reader/api/0/mark-all-as-read?client=scroll'
    },
    feedlySandbox: {
        markAsReadUrl: 'sandbox.feedly.com/v3/markers',
        categoriesUrl: 'sandbox.feedly.com/v3/categories',
        subscriptionsUrl: 'sandbox.feedly.com/v3/subscriptions',
        streamEntryUrl: 'sandbox.feedly.com/v3/streams/xSTREAMIDx/ids',
        markAsReadParams: {
            action: 'markAsRead'
            // lastReadEntryId: 'xUSERIDx'
        }
    }
};
var clientConfig = clientConfigs.feedlySandbox;
function MarkAllAsRead () {
    "use strict";
}
MarkAllAsRead.prototype = {
    mark: function () {
        "use strict";
        var that = this,
            prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

        scope.grwlog(scope.grwBundles);
        scope.grwlog(scope.grwBundles.getFormattedString);

        if (prompts.confirm(null, '',
                scope.grwBundles.getFormattedString('confirmmarkallasread', []))) {
            that.markAsRead();
        }
    },
    getSubscriptions: function (cb) {
        "use strict";
        var that = this;
        scope.request('GET', scope.generateUri(clientConfig.subscriptionsUrl), {
            onSuccess: function (response) {
                var categories = JSON.parse(response.responseText);
                cb(categories);
            },
            onError: function () {
                that.fireEvent('itemsMarkFailed');
            }
        });
    },
    getCategories: function (cb) {
        "use strict";
        var that = this;
        scope.request('GET', scope.generateUri(clientConfig.categoriesUrl), {
            onSuccess: function (response) {
                var categories = JSON.parse(response.responseText);
                cb(categories);
            },
            onError: function () {
                that.fireEvent('itemsMarkFailed');
            }
        });
    },
    getAnEntryId: function () {
        "use strict";
        var that = this;
        this.getCategories(function (categories) {
            Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
            Components.utils.import("resource://grwmodules/request.jsm", scope);
            scope.request('GET', scope.generateUri(clientConfig.streamEntryUrl.replace('xSTREAMIDx', categories[0].id)), {
                onSuccess: function (response) {
                    var categories = JSON.parse(response.responseText);
                    cb(categories);
                },
                onError: function () {
                    that.fireEvent('itemsMarkFailed');
                }
            });
        });
    },
    markAsRead: function () {
        "use strict";
        var that = this;

        that.getSubscriptions(function (subscriptions) {
            scope.userInfo.get(function (userInfo) {

                var uri = clientConfig.markAsReadUrl.replace('xUSERIDx', userInfo.id),
                    params = clientConfig.markAsReadParams;

                params.feedIds = subscriptions.map(function (c) {
                    return c.id;
                });
                params.type = 'feeds';
                params.asOf = Date.now();

                scope.request('POST',
                    scope.generateUri(uri),
                    {
                        onSuccess: function (response) {
                            that.fireEvent('itemsMarked');
                        },
                        onError: function () {
                            that.fireEvent('itemsMarkFailed');
                        }
                    }, JSON.stringify(params), {
                        'Content-Type': 'application/json'
                    });
            });
        });

    }
};

scope.augmentProto(MarkAllAsRead, scope.EventProvider);

let EXPORTED_SYMBOLS = ['MarkAllAsRead'];
