/*jslint indent: 2*/
/*global Components: true*/
var scope = {};
var Notifier = function (doc) {
  this.doc = doc;
};
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
Notifier.prototype = {
  showNotification: true,
  enabled: function () {
    scope.grwlog('notification: show: ' + scope.prefs.get.showNotificationWindow(), 'enabled: ' + this.showNotification);
    return scope.prefs.get.showNotificationWindow() && this.showNotification;
  },
  notificationWin: function (value) {
    var label = 'Google Reader Watcher',
        image = "chrome://grwatcher/skin/grwatcher.png",
        alertsService,
        alertWin,
        _this = this, clickCallback;

    clickCallback = {
      observe: function (subject, topic, data) {
        if (topic === 'alertclickcallback') {
          _this.fireEvent('notifierClicked');
        }
      }
    };


    if (!value) {
      value = 'Google Reader Watcher Notification';
    }
    try {
      // notifier for windows
      alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                        .getService(Components.interfaces.nsIAlertsService);

      alertsService.showAlertNotification(image, label, value, true, "", clickCallback);
    } catch (e) {
      try {
      // notifier for linux
        alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher)
                    .openWindow(null,
                    "chrome://global/content/alerts/alert.xul", "_blank",
                    "chrome,titlebar=no,popup=yes", null);

        alertWin.arguments = [image, label, value, true, "", 0, clickCallback];
        Components.utils.import("resource://grwmodules/timer.jsm", scope);
        scope.later(function () {
          alertWin.close();
        }, 10000);
      } catch (er) {}
    }
  },
  show: function (unreadCount, maxcount) {
    if (this.enabled() && unreadCount > 0) {
      var showval;
      Components.utils.import("resource://grwmodules/stringBundles.jsm", scope);
      if (scope.prefs.get.maximizeCounter() && maxcount && unreadCount > maxcount) {
        showval = maxcount + '+';
      } else {
        showval = unreadCount;
      }
      if (scope.grwBundles) {
        // it doesn't work in fennec yet
        this.notificationWin(scope.grwBundles.getFormattedString('notifierMSG', [showval]));
      } else {
        this.notificationWin('You have ' + showval + ' unread feeds');
      }
      this.showNotification = false;
    }
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(Notifier, scope.EventProvider);
let EXPORTED_SYMBOLS = ['Notifier'];
