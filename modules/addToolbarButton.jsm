/*jslint indent:2 */
/*global Components:true */
var addToolbarButton = function (doc, navi, customizeDone) {
  if (!doc || !navi) {
    return;
  }
  var toolbarItemId = "GRW-toolbaritem", // ID of button to add
      statusbarItemId = 'GRW-statusbar',
      setToolbarButton, setToolbarButtonFirstTime,
      getBrowserVersion, browserVersion;
  setToolbarButton = function () {
    try {
      // ID of element to insert after
      var afterId = "urlbar-container", navBar, curSet, pos, set;
      navBar  = doc.getElementById("nav-bar");
      curSet  = navBar.currentSet.split(",");

      if (curSet.indexOf(toolbarItemId) === -1) {
        pos = curSet.indexOf(afterId) + 1 || curSet.length;
        set = curSet.slice(0, pos).concat(toolbarItemId).concat(curSet.slice(pos));

        navBar.setAttribute("currentset", set.join(","));
        navBar.currentSet = set.join(",");
        doc.persist(navBar.id, "currentset");
        try {
          customizeDone(true);
        }
        catch (e) {}
      }
    } catch (er) {}
  };
  setToolbarButtonFirstTime = function () {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefBranch),
        btnInstalled = false,
        toolbarButton = doc.getElementById(toolbarItemId),
        statusbarButton = doc.getElementById(statusbarItemId);

    if (prefs.prefHasUserValue("extensions.grwatcher.toolbarBtnInstalled")) {
      btnInstalled = prefs.getBoolPref("extensions.grwatcher.toolbarBtnInstalled");
    }
    // we should install the toolbar button to force the user to use it,
    // because when he upgrades to newer firefox, he won't see anything
    if (!btnInstalled) {
      setToolbarButton();
      prefs.setBoolPref("extensions.grwatcher.toolbarBtnInstalled", true);
    // If no toolbar and statusbar button we must add the button because he
    // won't be able to use the extension
    // That could happen if user uses Firefox 4 or newer, because we removed
    // the statusbar button
    } else if (!toolbarButton && !statusbarButton) {
      // should ask to set toolbar button
      setToolbarButton();
    }
  };


  getBrowserVersion = function () {
    var version = null,
        ua = navi.userAgent.toString(),
        versionMatch;

    if (/Firefox|SeaMonkey/.test(ua)) {
      versionMatch = ua.match(/(?:Firefox|SeaMonkey)\/([\d.]+)/);
      if (versionMatch && versionMatch.length > 0) {
        version = versionMatch[1];
      }
    }
    return version;
  };

  browserVersion = parseInt(getBrowserVersion(), 10);
  if (browserVersion && browserVersion >= 4) {
    setToolbarButtonFirstTime();
  }
};

let EXPORTED_SYMBOLS=['addToolbarButton'];
