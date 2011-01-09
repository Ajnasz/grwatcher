(function () {
  var SetToolbarButton = function() {
    try {
      var myId    = "GRW-toolbaritem"; // ID of button to add
      var afterId = "urlbar-container";    // ID of element to insert after
      var navBar  = document.getElementById("nav-bar");
      var curSet  = navBar.currentSet.split(",");

      if (curSet.indexOf(myId) == -1) {
        var pos = curSet.indexOf(afterId) + 1 || curSet.length;
        var set = curSet.slice(0, pos).concat(myId).concat(curSet.slice(pos));

        navBar.setAttribute("currentset", set.join(","));
        navBar.currentSet = set.join(",");
        document.persist(navBar.id, "currentset");
        try {
          BrowserToolboxCustomizeDone(true);
        }
        catch (e) {}
      }
    }
    catch(e) {}
  };
  var SetToolbarButtonFirstTime = function() {
      var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                                        .getService(Components.interfaces.nsIPrefBranch);
      var btnInstalled = false;
      if (prefs.prefHasUserValue("extensions.grwatcher.toolbarBtnInstalled")) {
          btnInstalled = prefs.getBoolPref("extensions.grwatcher.toolbarBtnInstalled");
      }
      if (!btnInstalled) {
          SetToolbarButton();
          prefs.setBoolPref("extensions.grwatcher.toolbarBtnInstalled", true);
      }

  };
  GRW.UI.SetToolbarButtonFirstTime = SetToolbarButtonFirstTime;

}());
