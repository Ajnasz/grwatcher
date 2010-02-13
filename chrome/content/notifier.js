(function() {
  var getPrefs = GRW.Prefs.get;

  var notifier = function() {
  };
  notifier.prototype = {
    showNotification: true,
    notificationWin: function(value) {
      if(getPrefs.showNotificationWindow() !== false) {
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
              GRW.later(function(){alertWin.close()}, 10000);
          } catch(e) {
            GRW.log(e.message);
          }
        }
      }
    },
    show: function(unreadCount) {
      if(this.showNotification && unreadCount > 0) {
        if(GRW.strings) {
          // it doesn't work in fennec yet
          this.notificationWin(GRW.strings.getFormattedString('notifierMSG', [unreadCount]));
        } else {
          this.notificationWin('You have ' + unreadCount + ' unread feeds');
        }
        this.showNotification = false;
      }
    }
  };
  GRW.augmentProto(notifier, GRW.EventProvider);
  GRW.module('Notifier', notifier);
})();
