Components.utils.import("resource://grwmodules/EventProvider.jsm");
Components.utils.import("resource://grwmodules/Augment.jsm");
var CustomEvent = function(eventName) {
  this.eventName = eventName;
};
CustomEvent.prototype = {
  fire: function(args) {
    var args = [].slice.call(arguments);
    this.fireEvent(this.eventName, args);
  }
};
augmentProto(CustomEvent, EventProvider);
CustomEvent.prototype._subscribe = EventProvider.prototype.subscribe;
CustomEvent.prototype.subscribe = function (fn, obj, overrideContext) {
  this._subscribe(this.eventName, fn, obj, overrideContext);
};


let EXPORTED_SYMBOLS = ['CustomEvent'];
