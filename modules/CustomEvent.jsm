/*jslint indent:2*/
/*global Components: true*/
var scope = {};
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/Augment.jsm", scope);
var CustomEvent = function (eventName) {
  this.eventName = eventName;
};
CustomEvent.prototype = {
  fire: function (args) {
    args = [].slice.call(arguments);
    this.fireEvent(this.eventName, args);
  }
};
scope.augmentProto(CustomEvent, scope.EventProvider);
CustomEvent.prototype._subscribe = scope.EventProvider.prototype.subscribe;
CustomEvent.prototype.subscribe = function (fn, obj, overrideContext) {
  this._subscribe(this.eventName, fn, obj, overrideContext);
};


let EXPORTED_SYMBOLS = ['CustomEvent'];
