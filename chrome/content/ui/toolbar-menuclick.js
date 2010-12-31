(function() {
   const  openReader       = 'GRW-toolbar-menuitem-openreader',
          markAllAsRead    = 'GRW-toolbar-menuitem-markallasread',
          checkUnreadFeeds = 'GRW-toolbar-menuitem-getcounter',
          openPreferences  = 'GRW-toolbar-menuitem-openprefs',
          enableCookies    = 'GRW-toolbar-menuitem-enablecookies';

  var toolbarClick = function() {};
  toolbarClick.prototype = {
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

  GRW.augmentProto(toolbarClick, GRW.EventProvider);
  GRW.module('ToolbarMenuClick', toolbarClick);

})();
