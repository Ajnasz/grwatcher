(function() {
  var markAllAsRead = function() {
  };
  markAllAsRead.prototype = {
    mark: function() {
      var _this = this;
      if(confirm(GRW.strings.getString('confirmmarkallasread'))) {
        GRW.Token(function() {
          _this._markAsRead();
        }, true);
      }
    },
    _markAsRead: function() {
      var _this = this;
      var parameters = 'T=' + GRW.token.token + '&ts=' + (new Date()).getTime() + '999&s=user/-/state/com.google/reading-list';
      new GRW.Ajax({
        method: 'post',
        url: GRW.States.conntype + ':www.google.com/reader/api/0/mark-all-as-read?client=scroll',
        successHandler: function(request) {
          if(this.req.responseText == 'OK') {
            _this.fireEvent('onMarkAllAsRead');
          }
        }
      }, parameters);
    }
  };
  GRW.augmentProto(markAllAsRead, GRW.EventProvider);
  GRW.module('MarkAllAsRead', markAllAsRead);
})();
