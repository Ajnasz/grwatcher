/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @licence GPL v2
 */
// mozilla preferences component service
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
/**
 * returns the specified extension preference
 */
var getPref = {
  checkFreq : function() {
    return prefManager.getIntPref('extensions.grwatcher.checkfreq');
  },
  openInNewTab : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.openinnewtab');
  },
  resetCounter : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.resetcounter');
  },
  tooltipCounterPos : function(value) {
    return prefManager.getCharPref('extensions.grwatcher.tooltipcounterpos');
  },
  tooltipTitleLength : function(value) {
    return prefManager.getIntPref('extensions.grwatcher.tooltiptitlelength');
  },
  rememberLogin : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.rememberLogin');
  },
  leftClickOpen : function(value) {
    return prefManager.getIntPref('extensions.grwatcher.leftclickopen');
  },
  activateOpenedTab : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.activateopenedtab');
  },
  showNotificationWindow : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.shownotificationwindow');
  },
  showZeroCounter : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.showzerocounter');
  },
  useSecureConnection : function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.usesecureconnection');
  },
  userName : function(value) {
    return prefManager.getCharPref('extensions.grwatcher.username');
  },
  sortByLabels: function(value) {
    return prefManager.getBoolPref('extensions.grwatcher.sortbylabels');
  },
  filteredLabels: function(value) {
    return prefManager.getCharPref('extensions.grwatcher.filteredlabels');
  }
};
/**
 * set the specified extension preference
 */
var setPref = {
  checkFreq : function(value) {
    prefManager.setIntPref('extensions.grwatcher.checkfreq', value);
  },
  openInNewTab : function(value) {
    prefManager.setBoolPref('extensions.grwatcher.openinnewtab', value);
  },
  resetCounter : function(value) {
    prefManager.setBoolPref('extensions.grwatcher.resetcounter', value);
  },
  tooltipCounterPos : function(value) {
    prefManager.setCharPref('extensions.grwatcher.tooltipcounterpos', value);
  },
  tooltipTitleLength : function(value) {
    prefManager.setIntPref('extensions.grwatcher.tooltiptitlelength', value);
  },
  rememberLogin : function(value) {
    prefManager.setBoolPref('extensions.grwatcher.rememberLogin', value);
  },
  leftClickOpen : function(value) {
    prefManager.setIntPref('extensions.grwatcher.leftclickopen', value);
  },
  activateOpenedTab : function(value) {
    prefManager.setBoolPref('extensions.grwatcher.activateopenedtab', value);
  },
  showNotificationWindow : function(value) {
   prefManager.setBoolPref('extensions.grwatcher.shownotificationwindow', value);
  },
  showZeroCounter : function(value) {
   prefManager.setBoolPref('extensions.grwatcher.showzerocounter', value);
  },
  useSecureConnection : function(value) {
   prefManager.setBoolPref('extensions.grwatcher.usesecureconnection', value);
  },
  userName : function(value) {
   prefManager.setCharPref('extensions.grwatcher.username', value);
  },
  sortByLabels : function(value) {
   prefManager.setBoolPref('extensions.grwatcher.sortbylabels', value);
  },
  filteredLabels : function(value) {
   prefManager.setCharPref('extensions.grwatcher.filteredlabels', value);
  }
};
/**
 * save the preferences into the chrome when the pref dialog is accepted
 */
var savePreferences = function() {
  setPref.checkFreq(document.getElementById('GRW-checkfreq-field').value);
  setPref.openInNewTab(document.getElementById('GRW-openinnewtab-field').checked);
  setPref.resetCounter(document.getElementById('GRW-resetcounter-field').checked);
  setPref.tooltipCounterPos(document.getElementById('GRW-tooltipcounterpos-field').value);
  setPref.tooltipTitleLength(document.getElementById('GRW-tooltiptitlelength-field').value);
  setPref.rememberLogin(document.getElementById('GRW-rememberLogin-field').checked);
  setPref.leftClickOpen(document.getElementById('GRW-leftclickopen-field').value);
  setPref.activateOpenedTab(document.getElementById('GRW-activateopenedtab-field').checked);
  setPref.showNotificationWindow(document.getElementById('GRW-shownotificationwindow-field').checked);
  setPref.showZeroCounter(document.getElementById('GRW-showzerocounter-field').checked);
  setPref.useSecureConnection(document.getElementById('GRW-usesecureconnection-field').checked);
  setPref.sortByLabels(document.getElementById('GRW-sortbylabels-field').checked);
  setPref.filteredLabels(document.getElementById('GRW-filteredlabels-field').value);

  setPref.userName(document.getElementById('GRW-accountmanage-email').value);
  passwordManager.addPassword(document.getElementById('GRW-accountmanage-pass').value);

};
/**
 * sets the values on the pref dialog when it opens
 */
var setPrefPaneVals = function() {
  document.getElementById('GRW-checkfreq-field').value = getPref.checkFreq();
  document.getElementById('GRW-openinnewtab-field').checked = getPref.openInNewTab();
  document.getElementById('GRW-resetcounter-field').checked = getPref.resetCounter();
  document.getElementById('GRW-tooltipcounterpos-field').value = getPref.tooltipCounterPos();
  document.getElementById('GRW-tooltiptitlelength-field').value = getPref.tooltipTitleLength();
  document.getElementById('GRW-rememberLogin-field').checked = getPref.rememberLogin();
  document.getElementById('GRW-leftclickopen-field').value = getPref.leftClickOpen();
  document.getElementById('GRW-activateopenedtab-field').checked = getPref.activateOpenedTab();
  document.getElementById('GRW-accountmanage-pass').value = passwordManager.getPassword();
  document.getElementById('GRW-accountmanage-email').value = getPref.userName();
  document.getElementById('GRW-shownotificationwindow-field').checked = getPref.showNotificationWindow();
  document.getElementById('GRW-showzerocounter-field').checked = getPref.showZeroCounter();
  document.getElementById('GRW-usesecureconnection-field').checked = getPref.useSecureConnection();
  document.getElementById('GRW-sortbylabels-field').checked = getPref.sortByLabels();
  document.getElementById('GRW-filteredlabels-field').value = getPref.filteredLabels();
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
