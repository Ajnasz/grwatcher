/*jslint indent:2*/
var MenuClick = function (conf, doc) {
  this.conf = conf;
  this.doc = doc;
};
MenuClick.prototype = {
  init: function () {
    var _this = this,
        _openReader = this.doc.getElementById(this.conf.openReader),
        _markAllAsRed = this.doc.getElementById(this.conf.markAllAsRead),
        _checkUnreadFeeds = this.doc.getElementById(this.conf.checkUnreadFeeds),
        _openPreferences = this.doc.getElementById(this.conf.openPreferences),
        _enableCookies = this.doc.getElementById(this.conf.enableCookies);
    if (_openReader) {
      _openReader.addEventListener('command', function (event) {
        _this.fireEvent('openReader');
      }, true);
    }
    if (_markAllAsRed) {
      _markAllAsRed.addEventListener('command', function (event) {
        _this.fireEvent('markAllAsRead');
      }, true);
    }
    if (_checkUnreadFeeds) {
      _checkUnreadFeeds.addEventListener('command', function (event) {
        _this.fireEvent('checkUnreadFeeds');
      }, true);
    }
    if (_openPreferences) {
      _openPreferences.addEventListener('command', function (event) {
        _this.fireEvent('openPreferences');
      }, true);
    }
    if (_enableCookies) {
      _enableCookies.addEventListener('command', function (event) {
        _this.fireEvent('enableCookies');
      }, true);
    }
  }
};

Components.utils.import("resource://grwmodules/Augment.jsm");
Components.utils.import("resource://grwmodules/EventProvider.jsm");
/*global augmentProto: true, EventProvider: true*/
augmentProto(MenuClick, EventProvider);
let EXPORTED_SYMBOLS = ['MenuClick'];
