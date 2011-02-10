(function() {

  var notifier = function() {};
  notifier.prototype = {
    showNotification: true,
    notificationWin: function(value) {
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      if(Prefs.get.showNotificationWindow() !== false) {
        var label = 'Google Reader Watcher',
            image = "chrome://grwatcher/skin/grwatcher.png",
            alertsService,
            alertWin,
            _this = this;

        var clickCallback = {
          observe: function(subject, topic, data) {
            if(topic == 'alertclickcallback') {
              _this.fireEvent('notifierClicked');
            }
          }
        };


        if(!value) {
          value = 'Google Reader Watcher Notification';
        }
        try {
          // notifier for windows
          alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                            .getService(Components.interfaces.nsIAlertsService);

          alertsService.showAlertNotification(image , label, value, true, "", clickCallback);
        } catch(e) {
          try {
          // notifier for linux
            alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                        .getService(Components.interfaces.nsIWindowWatcher)
                        .openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);

              alertWin.arguments = [image, label, value, true, "", 0, clickCallback];
              Components.utils.import("resource://grwmodules/Timer.jsm");
              later(function(){alertWin.close()}, 10000);
          } catch(e) {}
        }
      }
    },
    show: function(unreadCount, maxcount) {
      if(this.showNotification && unreadCount > 0) {
        var showval;
          Components.utils.import("resource://grwmodules/Prefs.jsm");
        if(Prefs.get.maximizeCounter() && maxcount && unreadCount > maxcount) {
          showval = maxcount + '+';
        } else {
          showval = unreadCount;
        }
        if(GRW.strings) {
          // it doesn't work in fennec yet
          this.notificationWin(GRW.strings.getFormattedString('notifierMSG', [showval]));
        } else {
          this.notificationWin('You have ' + showval + ' unread feeds');
        }
        this.showNotification = false;
      }
    }
  };
  Components.utils.import("resource://grwmodules/Augment.jsm");
  Components.utils.import("resource://grwmodules/EventProvider.jsm");
  augmentProto(notifier, EventProvider);
  GRW.module('Notifier', notifier);
})();
