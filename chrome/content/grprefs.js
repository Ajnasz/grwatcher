(function () {
  /**
   * save the preferences into the chrome when the pref dialog is accepted
   * @method savePreferences
   * @namespace GRW
   */
  Components.utils.import("resource://grwmodules/Prefs.jsm");
  var doc = document,
      setPref = Prefs.set,
      getPref = Prefs.get,
      getById = function (id) {
        return doc.getElementById(id);
      };

  var savePreferences = function() {
    setPref.checkFreq(getById('GRW-checkfreq-field').value);
    setPref.delayStart(getById('GRW-delayStart-field').value);
    setPref.openInNewTab(getById('GRW-openinnewtab-field').checked);
    setPref.resetCounter(getById('GRW-resetcounter-field').checked);
    setPref.tooltipCounterPos(getById('GRW-tooltipcounterpos-field').value);
    setPref.tooltipTitleLength(getById('GRW-tooltiptitlelength-field').value);
    setPref.rememberLogin(getById('GRW-rememberLogin-field').checked);
    setPref.leftClickOpen(getById('GRW-leftclickopen-field').value);
    setPref.activateOpenedTab(getById('GRW-activateopenedtab-field').checked);
    setPref.showNotificationWindow(getById('GRW-shownotificationwindow-field').checked);
    setPref.showZeroCounter(getById('GRW-showzerocounter-field').checked);
    setPref.showCounter(getById('GRW-showcounter-field').checked);
    setPref.useSecureConnection(getById('GRW-usesecureconnection-field').checked);
    setPref.sortByLabels(getById('GRW-sortbylabels-field').checked);
    setPref.filteredLabels(getById('GRW-filteredlabels-field').value);
    setPref.maximizeCounter(getById('GRW-maximizecounter-field').checked);
    setPref.showitemsintooltip(getById('GRW-showitemsintooltip-field').checked);
    setPref.showitemsincontextmenu(getById('GRW-showitemsincontextmenu-field').checked);
  
    setPref.userName(getById('GRW-accountmanage-email').value);
    setPref.forceLogin(getById('GRW-forceLogin-field').checked);
    Components.utils.import("resource://grwmodules/PassManager.jsm");
    PassManager.addPassword(getById('GRW-accountmanage-pass').value);
  
  };
  /**
   * sets the values on the pref dialog when it opens
   * @method setPrefPaneVals
   * @namespace GRW
   */
  var setPrefPaneVals = function() {
    getById('GRW-checkfreq-field').value = getPref.checkFreq();
    getById('GRW-delayStart-field').value = getPref.delayStart();
    getById('GRW-openinnewtab-field').checked = getPref.openInNewTab();
    getById('GRW-resetcounter-field').checked = getPref.resetCounter();
    getById('GRW-tooltipcounterpos-field').value = getPref.tooltipCounterPos();
    getById('GRW-tooltiptitlelength-field').value = getPref.tooltipTitleLength();
    getById('GRW-rememberLogin-field').checked = getPref.rememberLogin();
    getById('GRW-leftclickopen-field').value = getPref.leftClickOpen();
    getById('GRW-activateopenedtab-field').checked = getPref.activateOpenedTab();
    getById('GRW-accountmanage-email').value = getPref.userName();
    getById('GRW-shownotificationwindow-field').checked = getPref.showNotificationWindow();
    getById('GRW-showcounter-field').checked = getPref.showCounter();
    getById('GRW-usesecureconnection-field').checked = getPref.useSecureConnection();
    getById('GRW-sortbylabels-field').checked = getPref.sortByLabels();
    getById('GRW-filteredlabels-field').value = getPref.filteredLabels();
    getById('GRW-maximizecounter-field').checked = getPref.maximizeCounter();
    getById('GRW-forceLogin-field').checked = getPref.forceLogin();
    getById('GRW-showitemsintooltip-field').checked = getPref.showitemsintooltip();
    getById('GRW-showitemsincontextmenu-field').checked = getPref.showitemsincontextmenu();
    Components.utils.import("resource://grwmodules/PassManager.jsm");
    getById('GRW-accountmanage-pass').value = PassManager.getPassword() || '';
  };
  /**
   * show/hide the newtab options
   * @method openNewTabCheckToogle
   * @namespace GRW
   */
  var openNewTabCheckToogle = function() {
    var cbfield = getById('GRW-openinnewtab-field');
    if(cbfield.checked) {
      getById('GRW-activateopenedtab-field').disabled = '';
      getById('GRW-leftclickopen-field').disabled = '';
      getById('GRW-leftclickopen-label').disabled = '';
  
      // document.getElementById('GRW-openinnewtab-options').style.display = '';
    } else {
      getById('GRW-activateopenedtab-field').disabled = 'disabled';
      getById('GRW-leftclickopen-field').disabled = 'disabled';
      getById('GRW-leftclickopen-label').disabled = 'disabled';
      // document.getElementById('GRW-openinnewtab-options').style.display = 'none';
    }
  };
  
  var counterHandler = function () {
    var counterField = getById('GRW-showcounter-field'),
        zeroCounterField = getById('GRW-showzerocounter-field'),
        maxCounterField = getById('GRW-maximizecounter-field'),
        updateZeroCounter;
    updateZeroCounter = function () {
      var disabled = counterField.checked ? '' : 'disabled';
      zeroCounterField.disabled = disabled;
      maxCounterField.disabled = disabled;
    };
    counterField.addEventListener('command', updateZeroCounter, false);
    updateZeroCounter();
  };
  GRW.initPrefs = function () {
        setPrefPaneVals();
        openNewTabCheckToogle();
        document.getElementById('GRW-openinnewtab-field').addEventListener('command', openNewTabCheckToogle, false);
        counterHandler();
  };

  GRW.module('SavePreferences', savePreferences);
})();
