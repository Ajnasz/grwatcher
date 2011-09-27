/*jslint indent: 2*/
var GRW = {};
(function () {
  var scope = {}, doc, setPref, getPref, getById,
      savePreferences, setPrefPaneVals, openNewTabCheckToogle, counterHandler,
      prefFields, workOnPrefs;
  /**
   * save the preferences into the chrome when the pref dialog is accepted
   * @method savePreferences
   * @namespace GRW
   */
  Components.utils.import("resource://grwmodules/prefs.jsm", scope);
  Components.utils.import("resource://grwmodules/passManager.jsm", scope);
  doc = document;
  setPref = scope.prefs.set;
  getPref = scope.prefs.get;
  getById = function (id) {
    return doc.getElementById(id);
  };

  prefFields = {
    'GRW-checkfreq-field': {cmd: 'checkFreq'},
    'GRW-delayStart-field': {cmd: 'delayStart'},
    'GRW-openinnewtab-field': {cmd: 'openInNewTab'},
    'GRW-resetcounter-field': {cmd: 'resetCounter'},
    'GRW-tooltipcounterpos-field': {cmd: 'tooltipCounterPos'},
    'GRW-tooltiptitlelength-field': {cmd: 'tooltipTitleLength'},
    'GRW-rememberLogin-field': {cmd: 'rememberLogin'},
    'GRW-leftclickopen-field': {cmd: 'leftClickOpen'},
    'GRW-activateopenedtab-field': {cmd: 'activateOpenedTab'},
    'GRW-shownotificationwindow-field': {cmd: 'showNotificationWindow'},
    'GRW-showzerocounter-field': {cmd: 'showZeroCounter'},
    'GRW-showcounter-field': {cmd: 'showCounter'},
    'GRW-usesecureconnection-field': {cmd: 'useSecureConnection'},
    'GRW-sortbylabels-field': {cmd: 'sortByLabels'},
    'GRW-filteredlabels-field': {cmd: 'filteredLabels'},
    'GRW-maximizecounter-field': {cmd: 'maximizeCounter'},
    'GRW-showitemsintooltip-field': {cmd: 'showitemsintooltip'},
    'GRW-showitemsincontextmenu-field': {cmd: 'showitemsincontextmenu'},
    'GRW-accountmanage-email': {cmd: 'userName'},
    'GRW-forceLogin-field': {cmd: 'forceLogin'},
    'GRW-accountmanage-pass': {
      cmd: {
        setter: function (value, elem) {
          scope.passManager.addPassword(value);
        },
        getter: function (elem) {
          elem.value = scope.passManager.getPassword() || '';
        }
      }
    }
  };

  workOnPrefs = function (save) {
    Object.keys(prefFields).forEach(function (id) {
      var elem = getById(id),
          cmd = prefFields[id].cmd,
          nodeName = elem.nodeName,
          elemValueSetterProp,
          value;
      switch (nodeName) {
      case 'textbox':
      case 'radiogroup':
      case 'menulist':
        value = elem.value;
        elemValueSetterProp = 'value';
        break;
      case 'checkbox':
        value = elem.checked;
        elemValueSetterProp = 'checked';
        break;
      }
      if (typeof cmd !== 'string') {
        if (save) {
          cmd.setter(value, elem);
        } else {
          cmd.getter(elem);
        }
      } else {
        if (save) {
          setPref[cmd](value, elem);
        } else {
          elem[elemValueSetterProp] = getPref[cmd](elem);
        }
      }

    });
  };

  savePreferences = function () {
    workOnPrefs(true);
  };

  setPrefPaneVals = function () {
    workOnPrefs(false);
  };

  /**
   * show/hide the newtab options
   * @method openNewTabCheckToogle
   * @namespace GRW
   */
  openNewTabCheckToogle = function () {
    var cbfield = getById('GRW-openinnewtab-field');
    if (cbfield.checked) {
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
  
  counterHandler = function () {
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
    document.getElementById('GRW-openinnewtab-field')
      .addEventListener('command', openNewTabCheckToogle, false);
    counterHandler();
  };

  GRW.savePreferences = savePreferences;
}());
