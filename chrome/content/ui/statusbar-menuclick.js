(function() {
   const  openReader       = 'GRW-statusbar-menuitem-openreader',
          markAllAsRead    = 'GRW-statusbar-menuitem-markallasread',
          checkUnreadFeeds = 'GRW-statusbar-menuitem-getcounter',
          openPreferences  = 'GRW-statusbar-menuitem-openprefs',
          enableCookies    = 'GRW-statusbar-menuitem-enablecookies';

  var menuClick = function() {};
  menuClick.prototype = {
    init: function() {
      var _this = this,
          _openReader       = document.getElementById(openReader),
          _markAllAsRed     = document.getElementById(markAllAsRead),
          _checkUnreadFeeds = document.getElementById(checkUnreadFeeds),
          _openPreferences  = document.getElementById(openPreferences),
          _enableCookies    = document.getElementById(enableCookies);
      if(_openReader) {
        _openReader.addEventListener('command', function(event) {
          _this.fireEvent('openReader')
        }, true);
      }
      if(_markAllAsRed) {
        _markAllAsRed.addEventListener('command', function(event) {
          _this.fireEvent('markAllAsRead');
        }, true);
      }
      if(_checkUnreadFeeds) {
        _checkUnreadFeeds.addEventListener('command', function(event) {
          _this.fireEvent('checkUnreadFeeds');
        }, true);
      }
      if(_openPreferences) {
        _openPreferences.addEventListener('command', function(event) {
          _this.fireEvent('openPreferences');
        }, true);
      }
      if(_enableCookies) {
        _enableCookies.addEventListener('command', function(event) {
          _this.fireEvent('enableCookies');
        }, true);
      }
    }
  };

  Components.utils.import("resource://grwmodules/Augment.jsm");
  augmentProto(menuClick, GRW.EventProvider);
  GRW.module('MenuClick', menuClick);

})();
