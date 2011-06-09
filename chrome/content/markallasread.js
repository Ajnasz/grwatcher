(function() {
  var markAllAsRead = function() {
  };
  markAllAsRead.prototype = {
    mark: function() {
      var _this = this;
      if(confirm(GRW.strings.getString('confirmmarkallasread'))) {
        _this._markAsRead();
      }
    },
    _markAsRead: function() {
      var _this = this;
      GRW.getToken(function() {
        Components.utils.import("resource://grwmodules/generateUri.jsm");
        GRW.request('post',
          generateUri('www.google.com/reader/api/0/mark-all-as-read?client=scroll'),
          {
            onSuccess: function(request) {
              if(request.responseText == 'OK') {
                _this.fireEvent('onMarkAllAsRead');
              }
            },
            onError: function() {
                _this.fireEvent('onMarkAllAsReadFailed');
            },
          }, 's=user/-/state/com.google/reading-list&T=' + GRW.token.token);
      });
    }
  };
  Components.utils.import("resource://grwmodules/Augment.jsm");
  Components.utils.import("resource://grwmodules/EventProvider.jsm");
  augmentProto(markAllAsRead, EventProvider);
  GRW.module('MarkAllAsRead', new markAllAsRead);
})();
