(function() {
   const  openReader       = 'GRW-statusbar-menuitem-openreader',
          markAllAsRead    = 'GRW-statusbar-menuitem-markallasread',
          checkUnreadFeeds = 'GRW-statusbar-menuitem-getcounter',
          openPreferences  = 'GRW-statusbar-menuitem-openprefs',
          enableCookies    = 'GRW-statusbar-menuitem-enablecookies';

  var menuClick = function() {};
  menuClick.prototype = {
    init: function() {
      var _this = this;
      document.getElementById(openReader).addEventListener('command', function(event) {
        _this.fireEvent('openReader')
      }, true);
      document.getElementById(markAllAsRead).addEventListener('command', function(event) {
        _this.fireEvent('markAllAsRead');
      }, true);
      document.getElementById(checkUnreadFeeds).addEventListener('command', function(event) {
        _this.fireEvent('checkUnreadFeeds');
      }, true);
      document.getElementById(openPreferences).addEventListener('command', function(event) {
        _this.fireEvent('openPreferences');
      }, true);
      document.getElementById(enableCookies).addEventListener('command', function(event) {
        _this.fireEvent('enableCookies');
      }, true);
    }
  };

  GRW.augmentProto(menuClick, GRW.EventProvider);
  
  GRW.module('MenuClick', menuClick);

})();
