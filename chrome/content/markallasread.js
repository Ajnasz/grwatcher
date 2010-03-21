(function() {
  var markAllAsRead = function() {
  };
  markAllAsRead.prototype = {
    mark: function() {
      var _this = this;
      if(confirm(GRW.strings.getString('confirmmarkallasread'))) {
        GRW.Token({
            success: {
              fn: this._markAsRead,
              scope: this,
            },
            failure: {
              fn: function() {
                this.fireEvent('onMarkAllAsReadFailed');
              },
              scope: this,
            }
        });
      }
    },
    _markAsRead: function() {
      var _this = this;
      var parameters = {
          // T: GRW.token.token,
          ts: (new Date()).getTime() + '999',
          s:'user/-/state/com.google/reading-list',
        };
        GRW.request('post', GRW.States.conntype + ':www.google.com/reader/api/0/mark-all-as-read?client=scroll', {
          onSuccess: function(request) {
            if(this.req.responseText == 'OK') {
              _this.fireEvent('onMarkAllAsRead');
            }
          },
          onError: function() {
              _this.fireEvent('onMarkAllAsReadFailed');
          },

        }, parameters);
        /*
        new GRW.Ajax({
        method: 'post',
        url: GRW.States.conntype + ':www.google.com/reader/api/0/mark-all-as-read?client=scroll',
        onSuccess: function(request) {
          if(this.req.responseText == 'OK') {
            _this.fireEvent('onMarkAllAsRead');
          }
        },
        onError: function() {
            _this.fireEvent('onMarkAllAsReadFailed');
        },
      }, parameters).send();
      */
    }
  };
  GRW.augmentProto(markAllAsRead, GRW.EventProvider);
  GRW.module('MarkAllAsRead', new markAllAsRead);
})();
