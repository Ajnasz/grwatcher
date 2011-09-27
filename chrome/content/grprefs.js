/*jslint indent: 2*/
var GRW = {};
(function () {
  var scope = {}, doc, setPref, getPref, getById,
      savePreferences, setPrefPaneVals, openNewTabCheckToogle, counterHandler,
      prefFields, workOnPrefs, handlePref;
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

  prefFields = [
    {id: 'GRW-checkfreq-field', cmd: 'checkFreq'},
    {id: 'GRW-delayStart-field', cmd: 'delayStart'},
    {id: 'GRW-openinnewtab-field', cmd: 'openInNewTab'},
    {id: 'GRW-resetcounter-field', cmd: 'resetCounter'},
    {id: 'GRW-tooltipcounterpos-field', cmd: 'tooltipCounterPos'},
    {id: 'GRW-tooltiptitlelength-field', cmd: 'tooltipTitleLength'},
    {id: 'GRW-rememberLogin-field', cmd: 'rememberLogin'},
    {id: 'GRW-leftclickopen-field', cmd: 'leftClickOpen'},
    {id: 'GRW-activateopenedtab-field', cmd: 'activateOpenedTab'},
    {id: 'GRW-shownotificationwindow-field', cmd: 'showNotificationWindow'},
    {id: 'GRW-showzerocounter-field', cmd: 'showZeroCounter'},
    {id: 'GRW-showcounter-field', cmd: 'showCounter'},
    {id: 'GRW-usesecureconnection-field', cmd: 'useSecureConnection'},
    {id: 'GRW-sortbylabels-field', cmd: 'sortByLabels'},
    {id: 'GRW-filteredlabels-field', cmd: 'filteredLabels'},
    {id: 'GRW-maximizecounter-field', cmd: 'maximizeCounter'},
    {id: 'GRW-showitemsintooltip-field', cmd: 'showitemsintooltip'},
    {id: 'GRW-showitemsincontextmenu-field', cmd: 'showitemsincontextmenu'},
    {id: 'GRW-accountmanage-email', cmd: 'userName'},
    {id: 'GRW-forceLogin-field', cmd: 'forceLogin'},
    {
      id: 'GRW-accountmanage-pass',
      cmd: {
        setter: function (value, elem) {
          scope.passManager.addPassword(value);
        },
        getter: function (elem) {
          elem.value = scope.passManager.getPassword() || '';
        }
      }
    }
  ];

  handlePref = function (save) {
      return function (item) {
          var id = item.id,
              elem = getById(id),
              cmd = item.cmd,
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
        };
    };

  workOnPrefs = function (save) {
    var handler = handlePref(save);
    prefFields.forEach(handlePref(save));
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
