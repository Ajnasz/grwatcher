var GRW = {};
(function () {
    var scope = {}, doc, setPref, getPref, getById,
        prefFields;
    Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    Components.utils.import("resource://grwmodules/passManager.jsm", scope);
    Components.utils.import("resource://grwmodules/Oauth2.jsm", scope);
    Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
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
        // {id: 'GRW-rememberLogin-field', cmd: 'rememberLogin'},
        {id: 'GRW-leftclickopen-field', cmd: 'leftClickOpen'},
        {id: 'GRW-browserlikeopen-field', cmd: 'browserlikeWindowOpen'},
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
        // {id: 'GRW-forceLogin-field', cmd: 'forceLogin'},
        {id: 'GRW-have-multiple-accounts', cmd: 'haveMultipleAccounts'},
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

    function handlePref(save) {
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
    }

    function workOnPrefs(save) {
        var handler = handlePref(save);
        prefFields.forEach(handlePref(save));
    }

    function savePreferences() {
        workOnPrefs(true);
        Components.utils.import("resource://grwmodules/GRWWindows.jsm", scope);
        scope.grwWindows.updateGRStates();
    }

    function setPrefPaneVals() {
        workOnPrefs(false);
    }

    function windowOpenHandler() {
        var field = getById('GRW-browserlikeopen-field');
        if (field.checked) {
            getById('GRW-openinnewtab-field').disabled = 'disabled';
            getById('GRW-activateopenedtab-field').disabled = 'disabled';
            getById('GRW-leftclickopen-field').disabled = 'disabled';
        } else {
            getById('GRW-openinnewtab-field').disabled = '';
            getById('GRW-activateopenedtab-field').disabled = '';
            getById('GRW-leftclickopen-field').disabled = '';
        }
    }

    /**
    * show/hide the newtab options
    * @method openNewTabCheckToogle
    */
    function openNewTabCheckToogle() {
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
    }
    
    function counterHandler() {
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
    }
    function oAuthSettings() {
        var updateAccountTabs = function () {
            if (scope.prefs.get.oauthCode()) {
                getById('GRW-auth-tab-clientlogin').setAttribute('disabled', true);
                getById('GRW-auth-tab-oauth').parentNode.selectedIndex = 1;
                getById('GRW-oauth-clear').removeAttribute('disabled');
            } else {
                getById('GRW-auth-tab-clientlogin').removeAttribute('disabled');
                getById('GRW-oauth-clear').setAttribute('disabled', true);
            }
        };
        getById('GRW-oauth-opener').addEventListener('click', function () {
            scope.oauth.auth(updateAccountTabs);
        }, false);
        getById('GRW-oauth-clear').addEventListener('click', function () {
            scope.prefs.set.oauthCode('');
            scope.prefs.set.oauthRefreshToken('');
            Components.utils.import("resource://grwmodules/getter.jsm", scope);
            scope.getter.unsetDefaultHeader('Authorization');
            updateAccountTabs();
        }, false);
        updateAccountTabs();
    }
    GRW.initPrefs = function () {
        setPrefPaneVals();
        openNewTabCheckToogle();
        document.getElementById('GRW-openinnewtab-field')
            .addEventListener('command', openNewTabCheckToogle, false);
        windowOpenHandler();
        getById('GRW-browserlikeopen-field').addEventListener('command', windowOpenHandler, false);
        counterHandler();
        oAuthSettings();
    };

    GRW.savePreferences = savePreferences;
}());
