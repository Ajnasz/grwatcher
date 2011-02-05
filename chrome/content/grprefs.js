(function() {
  /**
   * save the preferences into the chrome when the pref dialog is accepted
   * @method savePreferences
   * @namespace GRW
   */
  Components.utils.import("resource://grwmodules/Prefs.jsm");
  var doc = document,
      setPref = Prefs.set,
      getPref = Prefs.get;

  var savePreferences = function() {
    setPref.checkFreq(doc.getElementById('GRW-checkfreq-field').value);
    setPref.delayStart(doc.getElementById('GRW-delayStart-field').value);
    setPref.openInNewTab(doc.getElementById('GRW-openinnewtab-field').checked);
    setPref.resetCounter(doc.getElementById('GRW-resetcounter-field').checked);
    setPref.tooltipCounterPos(doc.getElementById('GRW-tooltipcounterpos-field').value);
    setPref.tooltipTitleLength(doc.getElementById('GRW-tooltiptitlelength-field').value);
    setPref.rememberLogin(doc.getElementById('GRW-rememberLogin-field').checked);
    setPref.leftClickOpen(doc.getElementById('GRW-leftclickopen-field').value);
    setPref.activateOpenedTab(doc.getElementById('GRW-activateopenedtab-field').checked);
    setPref.showNotificationWindow(doc.getElementById('GRW-shownotificationwindow-field').checked);
    setPref.showZeroCounter(doc.getElementById('GRW-showzerocounter-field').checked);
    setPref.useSecureConnection(doc.getElementById('GRW-usesecureconnection-field').checked);
    setPref.sortByLabels(doc.getElementById('GRW-sortbylabels-field').checked);
    setPref.filteredLabels(doc.getElementById('GRW-filteredlabels-field').value);
    setPref.maximizeCounter(doc.getElementById('GRW-maximizecounter-field').checked);
    setPref.showitemsintooltip(doc.getElementById('GRW-showitemsintooltip-field').checked);
    setPref.showitemsincontextmenu(doc.getElementById('GRW-showitemsincontextmenu-field').checked);
  
    setPref.userName(doc.getElementById('GRW-accountmanage-email').value);
    setPref.forceLogin(doc.getElementById('GRW-forceLogin-field').checked);
    Components.utils.import("resource://grwmodules/PassManager.jsm");
    PassManager.addPassword(doc.getElementById('GRW-accountmanage-pass').value);
  
  };
  /**
   * sets the values on the pref dialog when it opens
   * @method setPrefPaneVals
   * @namespace GRW
   */
  var setPrefPaneVals = function() {
    doc.getElementById('GRW-checkfreq-field').value = getPref.checkFreq();
    doc.getElementById('GRW-delayStart-field').value = getPref.delayStart();
    doc.getElementById('GRW-openinnewtab-field').checked = getPref.openInNewTab();
    doc.getElementById('GRW-resetcounter-field').checked = getPref.resetCounter();
    doc.getElementById('GRW-tooltipcounterpos-field').value = getPref.tooltipCounterPos();
    doc.getElementById('GRW-tooltiptitlelength-field').value = getPref.tooltipTitleLength();
    doc.getElementById('GRW-rememberLogin-field').checked = getPref.rememberLogin();
    doc.getElementById('GRW-leftclickopen-field').value = getPref.leftClickOpen();
    doc.getElementById('GRW-activateopenedtab-field').checked = getPref.activateOpenedTab();
    doc.getElementById('GRW-accountmanage-email').value = getPref.userName();
    doc.getElementById('GRW-shownotificationwindow-field').checked = getPref.showNotificationWindow();
    doc.getElementById('GRW-showzerocounter-field').checked = getPref.showZeroCounter();
    doc.getElementById('GRW-usesecureconnection-field').checked = getPref.useSecureConnection();
    doc.getElementById('GRW-sortbylabels-field').checked = getPref.sortByLabels();
    doc.getElementById('GRW-filteredlabels-field').value = getPref.filteredLabels();
    doc.getElementById('GRW-maximizecounter-field').checked = getPref.maximizeCounter();
    doc.getElementById('GRW-forceLogin-field').checked = getPref.forceLogin();
    doc.getElementById('GRW-showitemsintooltip-field').checked = getPref.showitemsintooltip();
    doc.getElementById('GRW-showitemsincontextmenu-field').checked = getPref.showitemsincontextmenu();
    Components.utils.import("resource://grwmodules/PassManager.jsm");
    doc.getElementById('GRW-accountmanage-pass').value = PassManager.getPassword() || '';
  };
  /**
   * show/hide the newtab options
   * @method openNewTabCheckToogle
   * @namespace GRW
   */
  var openNewTabCheckToogle = function() {
    var cbfield = doc.getElementById('GRW-openinnewtab-field');
    if(cbfield.checked) {
      doc.getElementById('GRW-activateopenedtab-field').disabled = '';
      doc.getElementById('GRW-leftclickopen-field').disabled = '';
      doc.getElementById('GRW-leftclickopen-label').disabled = '';
  
      // document.getElementById('GRW-openinnewtab-options').style.display = '';
    } else {
      doc.getElementById('GRW-activateopenedtab-field').disabled = 'disabled';
      doc.getElementById('GRW-leftclickopen-field').disabled = 'disabled';
      doc.getElementById('GRW-leftclickopen-label').disabled = 'disabled';
      // document.getElementById('GRW-openinnewtab-options').style.display = 'none';
    }
  };
  GRW.module('SavePreferences', savePreferences);
  GRW.module('SetPrefPaneVals', setPrefPaneVals);
  GRW.module('OpenNewTabCheckToogle', openNewTabCheckToogle);
})();
