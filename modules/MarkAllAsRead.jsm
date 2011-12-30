/*jslint indent: 2*/
/*global Components:true*/
var scope = {};
var MarkAllAsRead = function () {};
MarkAllAsRead.prototype = {
  mark: function () {
    var _this = this,
        prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                    .getService(Components.interfaces.nsIPromptService);

    Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
    Components.utils.import("resource://grwmodules/stringBundles.jsm", scope);
    scope.grwlog(scope.grwBundles)
    scope.grwlog(scope.grwBundles.getFormattedString)

    if (prompts.confirm(null, '', scope.grwBundles.getFormattedString('confirmmarkallasread', []))) {
      _this._markAsRead();
    }
  },
  _markAsRead: function () {
    var _this = this;
    Components.utils.import("resource://grwmodules/getToken.jsm", scope);
    scope.getToken(function (token) {
      Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
      Components.utils.import("resource://grwmodules/request.jsm", scope);
      scope.request('POST',
        scope.generateUri('www.google.com/reader/api/0/mark-all-as-read?client=scroll'),
        {
          onSuccess: function (response) {
            if (response.responseText === 'OK') {
              _this.fireEvent('onMarkAllAsRead');
            }
          },
          onError: function () {
            _this.fireEvent('onMarkAllAsReadFailed');
          }
        }, 's=user/-/state/com.google/reading-list&T=' + token.token);
    });
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(MarkAllAsRead, scope.EventProvider);

let EXPORTED_SYMBOLS = ['MarkAllAsRead'];
