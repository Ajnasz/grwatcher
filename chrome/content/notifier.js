(function() {
  var showNotification = true;
  var clickCallback = {
    observe: function(subject, topic, data) {
      if(topic == 'alertclickcallback') {
        showNotification = true;
      }
    }
  };

  var notificationWin = function(value) {
    if(GRW.Prefs.get.showNotificationWindow() !== false) {
      var label = 'Google Reader Watcher',
          image = "chrome://grwatcher/skin/grwatcher.png",
          alertsService,
          alertWin;

      if(!value) {
        value = 'Google Reader Watcher Notification';
      }
      try {
        // notifier for windows
        alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                          .etService(Components.interfaces.nsIAlertsService);

        alertsService.showAlertNotification(image , label, value, true, "", clickCallback);
      } catch(e) {
        try {
        // notifier for linux
          alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                      .getService(Components.interfaces.nsIWindowWatcher)
                      .openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);

            alertWin.arguments = [image, label, value, true, "", 0, clickCallback];
            setTimeout(function(){alertWin.close()}, 10000);
        } catch(e) {
          GRW.log(e.message);
        }
      }
    }
  };
  var notifier = function(unreadCount) {
    if(showNotification && unreadCount > 0) {
      // notificationWin(GRW.strings.getFormattedString('notifierMSG', [unreadCount]));
      notificationWin('You have ' + unreadCount + ' unread feeds');
      showNotification = false;
    }
  };
  GRW.Notifier = notifier;
})();
