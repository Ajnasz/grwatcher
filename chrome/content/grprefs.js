/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence GPL v2
 */
/**
 * mozilla preferences component service
 * @property prefManager
 * @namespace GRW
 */
GRW.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
/**
 * save the preferences into the chrome when the pref dialog is accepted
 * @method savePreferences
 * @namespace GRW
 */
GRW.savePreferences = function() {
  GRW.Prefs.setPref.checkFreq(document.getElementById('GRW-checkfreq-field').value);
  GRW.Prefs.setPref.delayStart(document.getElementById('GRW-delayStart-field').value);
  GRW.Prefs.setPref.openInNewTab(document.getElementById('GRW-openinnewtab-field').checked);
  GRW.Prefs.setPref.resetCounter(document.getElementById('GRW-resetcounter-field').checked);
  GRW.Prefs.setPref.tooltipCounterPos(document.getElementById('GRW-tooltipcounterpos-field').value);
  GRW.Prefs.setPref.tooltipTitleLength(document.getElementById('GRW-tooltiptitlelength-field').value);
  GRW.Prefs.setPref.rememberLogin(document.getElementById('GRW-rememberLogin-field').checked);
  GRW.Prefs.setPref.leftClickOpen(document.getElementById('GRW-leftclickopen-field').value);
  GRW.Prefs.setPref.activateOpenedTab(document.getElementById('GRW-activateopenedtab-field').checked);
  GRW.Prefs.setPref.showNotificationWindow(document.getElementById('GRW-shownotificationwindow-field').checked);
  GRW.Prefs.setPref.showZeroCounter(document.getElementById('GRW-showzerocounter-field').checked);
  GRW.Prefs.setPref.useSecureConnection(document.getElementById('GRW-usesecureconnection-field').checked);
  GRW.Prefs.setPref.sortByLabels(document.getElementById('GRW-sortbylabels-field').checked);
  GRW.Prefs.setPref.filteredLabels(document.getElementById('GRW-filteredlabels-field').value);
  GRW.Prefs.setPref.maximizeCounter(document.getElementById('GRW-maximizecounter-field').checked);
  GRW.Prefs.setPref.showitemsintooltip(document.getElementById('GRW-showitemsintooltip-field').checked);
  GRW.Prefs.setPref.showitemsincontextmenu(document.getElementById('GRW-showitemsincontextmenu-field').checked);

  GRW.Prefs.setPref.userName(document.getElementById('GRW-accountmanage-email').value);
  GRW.Prefs.setPref.forceLogin(document.getElementById('GRW-forceLogin-field').checked);
  GRW.PasswordManager.addPassword(document.getElementById('GRW-accountmanage-pass').value);

};
/**
 * sets the values on the pref dialog when it opens
 * @method setPrefPaneVals
 * @namespace GRW
 */
GRW.setPrefPaneVals = function() {
  document.getElementById('GRW-checkfreq-field').value = GRW.Prefs.getPref.checkFreq();
  document.getElementById('GRW-delayStart-field').value = GRW.Prefs.getPref.delayStart();
  document.getElementById('GRW-openinnewtab-field').checked = GRW.Prefs.getPref.openInNewTab();
  document.getElementById('GRW-resetcounter-field').checked = GRW.Prefs.getPref.resetCounter();
  document.getElementById('GRW-tooltipcounterpos-field').value = GRW.Prefs.getPref.tooltipCounterPos();
  document.getElementById('GRW-tooltiptitlelength-field').value = GRW.Prefs.getPref.tooltipTitleLength();
  document.getElementById('GRW-rememberLogin-field').checked = GRW.Prefs.getPref.rememberLogin();
  document.getElementById('GRW-leftclickopen-field').value = GRW.Prefs.getPref.leftClickOpen();
  document.getElementById('GRW-activateopenedtab-field').checked = GRW.Prefs.getPref.activateOpenedTab();
  document.getElementById('GRW-accountmanage-pass').value = GRW.PasswordManager.getPassword() || '';
  document.getElementById('GRW-accountmanage-email').value = GRW.Prefs.getPref.userName();
  document.getElementById('GRW-shownotificationwindow-field').checked = GRW.Prefs.getPref.showNotificationWindow();
  document.getElementById('GRW-showzerocounter-field').checked = GRW.Prefs.getPref.showZeroCounter();
  document.getElementById('GRW-usesecureconnection-field').checked = GRW.Prefs.getPref.useSecureConnection();
  document.getElementById('GRW-sortbylabels-field').checked = GRW.Prefs.getPref.sortByLabels();
  document.getElementById('GRW-filteredlabels-field').value = GRW.Prefs.getPref.filteredLabels();
  document.getElementById('GRW-maximizecounter-field').checked = GRW.Prefs.getPref.maximizeCounter();
  document.getElementById('GRW-forceLogin-field').checked = GRW.Prefs.getPref.forceLogin();
  document.getElementById('GRW-showitemsintooltip-field').checked = GRW.Prefs.getPref.showitemsintooltip();
  document.getElementById('GRW-showitemsincontextmenu-field').checked = GRW.Prefs.getPref.showitemsincontextmenu();
};
/**
 * show/hide the newtab options
 * @method openNewTabCheckToogle
 * @namespace GRW
 */
GRW.openNewTabCheckToogle = function() {
  var cbfield = document.getElementById('GRW-openinnewtab-field');
  if(cbfield.checked) {
    document.getElementById('GRW-activateopenedtab-field').disabled = '';
    document.getElementById('GRW-leftclickopen-field').disabled = '';
    document.getElementById('GRW-leftclickopen-label').disabled = '';

    // document.getElementById('GRW-openinnewtab-options').style.display = '';
  } else {
    document.getElementById('GRW-activateopenedtab-field').disabled = 'disabled';
    document.getElementById('GRW-leftclickopen-field').disabled = 'disabled';
    document.getElementById('GRW-leftclickopen-label').disabled = 'disabled';
    // document.getElementById('GRW-openinnewtab-options').style.display = 'none';
  }
};
