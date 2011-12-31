/*global Components: true */
/**
  * @class EventProvider
  */
var EventProvider = function () {};
EventProvider.prototype = {
    subscribe: function (eventName, fn, obj, overrideContext) {
        if (!this._subscribers) {
            this._subscribers = {};
        }
        if (!this._subscribers[eventName]) {
            this._subscribers[eventName] = [];
        }
        this._subscribers[eventName].push({fn: fn, obj: obj, overrideContext: overrideContext});
    },
    on: function () {
        this.subscribe.apply(this, arguments);
    },
    fireEvent: function (eventName, args) {
        if (!this._subscribers || !this._subscribers[eventName]) {
            return;
        }
        var subscribers = this._subscribers[eventName], i, sl, subscription;
        for (i = 0, sl = subscribers.length; i < sl; i += 1) {
            subscription = subscribers[i];
            try {
                subscription.fn.call(subscription.context || this, args);
            } catch (err) {
                Components.utils.reportError(err);
            }
        }
    },
    unsubscribeAll: function () {
        var eventName;
        for (eventName in this._subscribers) {
            if (this._subscribers.hasOwnProperty(eventName)) {
                delete this._subscribers[eventName];
            }
        }
        this._subscribers = {};
    }
};
var EXPORTED_SYMBOLS = ['EventProvider'];
