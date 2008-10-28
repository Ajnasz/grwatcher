/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence GPL v2
 */
// mozilla preferences component service
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
/**
 * save the preferences into the chrome when the pref dialog is accepted
 */
var savePreferences = function() {
  GRPrefs.setPref.checkFreq(document.getElementById('GRW-checkfreq-field').value);
  GRPrefs.setPref.delayStart(document.getElementById('GRW-delayStart-field').value);
  GRPrefs.setPref.openInNewTab(document.getElementById('GRW-openinnewtab-field').checked);
  GRPrefs.setPref.resetCounter(document.getElementById('GRW-resetcounter-field').checked);
  GRPrefs.setPref.tooltipCounterPos(document.getElementById('GRW-tooltipcounterpos-field').value);
  GRPrefs.setPref.tooltipTitleLength(document.getElementById('GRW-tooltiptitlelength-field').value);
  GRPrefs.setPref.rememberLogin(document.getElementById('GRW-rememberLogin-field').checked);
  GRPrefs.setPref.leftClickOpen(document.getElementById('GRW-leftclickopen-field').value);
  GRPrefs.setPref.activateOpenedTab(document.getElementById('GRW-activateopenedtab-field').checked);
  GRPrefs.setPref.showNotificationWindow(document.getElementById('GRW-shownotificationwindow-field').checked);
  GRPrefs.setPref.showZeroCounter(document.getElementById('GRW-showzerocounter-field').checked);
  GRPrefs.setPref.useSecureConnection(document.getElementById('GRW-usesecureconnection-field').checked);
  GRPrefs.setPref.sortByLabels(document.getElementById('GRW-sortbylabels-field').checked);
  GRPrefs.setPref.filteredLabels(document.getElementById('GRW-filteredlabels-field').value);
  GRPrefs.setPref.maximizeCounter(document.getElementById('GRW-maximizecounter-field').checked);

  GRPrefs.setPref.userName(document.getElementById('GRW-accountmanage-email').value);
  GRPrefs.setPref.forceLogin(document.getElementById('GRW-forceLogin-field').checked);
  passwordManager.addPassword(document.getElementById('GRW-accountmanage-pass').value);

};
/**
 * sets the values on the pref dialog when it opens
 */
var setPrefPaneVals = function() {
  document.getElementById('GRW-checkfreq-field').value = GRPrefs.getPref.checkFreq();
  document.getElementById('GRW-delayStart-field').value = GRPrefs.getPref.delayStart();
  document.getElementById('GRW-openinnewtab-field').checked = GRPrefs.getPref.openInNewTab();
  document.getElementById('GRW-resetcounter-field').checked = GRPrefs.getPref.resetCounter();
  document.getElementById('GRW-tooltipcounterpos-field').value = GRPrefs.getPref.tooltipCounterPos();
  document.getElementById('GRW-tooltiptitlelength-field').value = GRPrefs.getPref.tooltipTitleLength();
  document.getElementById('GRW-rememberLogin-field').checked = GRPrefs.getPref.rememberLogin();
  document.getElementById('GRW-leftclickopen-field').value = GRPrefs.getPref.leftClickOpen();
  document.getElementById('GRW-activateopenedtab-field').checked = GRPrefs.getPref.activateOpenedTab();
  document.getElementById('GRW-accountmanage-pass').value = passwordManager.getPassword();
  document.getElementById('GRW-accountmanage-email').value = GRPrefs.getPref.userName();
  document.getElementById('GRW-shownotificationwindow-field').checked = GRPrefs.getPref.showNotificationWindow();
  document.getElementById('GRW-showzerocounter-field').checked = GRPrefs.getPref.showZeroCounter();
  document.getElementById('GRW-usesecureconnection-field').checked = GRPrefs.getPref.useSecureConnection();
  document.getElementById('GRW-sortbylabels-field').checked = GRPrefs.getPref.sortByLabels();
  document.getElementById('GRW-filteredlabels-field').value = GRPrefs.getPref.filteredLabels();
  document.getElementById('GRW-maximizecounter-field').checked = GRPrefs.getPref.maximizeCounter();
  document.getElementById('GRW-forceLogin-field').checked = GRPrefs.getPref.forceLogin();
};
/**
 * show/hide the newtab options
 */
var openNewTabCheckToogle = function() {
  var cbfield = document.getElementById('GRW-openinnewtab-field');
  if(cbfield.checked) {
    document.getElementById('GRW-activateopenedtab-field').disabled = '';
    document.getElementById('GRW-leftclickopen-field').disabled = '';
    document.getElementById('GRW-leftclickopen-label').disabled = '';

    // document.getElementById('GRW-openinnewtab-options').style.display = '';
  }
  else {
    document.getElementById('GRW-activateopenedtab-field').disabled = 'disabled';
    document.getElementById('GRW-leftclickopen-field').disabled = 'disabled';
    document.getElementById('GRW-leftclickopen-label').disabled = 'disabled';
    // document.getElementById('GRW-openinnewtab-options').style.display = 'none';
  }
};
