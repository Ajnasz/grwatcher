/**
  * mozilla preferences component service
  * @private
  */
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
    getCharPref = prefManager.getCharPref,
    getIntPref = prefManager.getIntPref,
    getBoolPref = prefManager.getBoolPref,
    setCharPref = prefManager.setCharPref,
    setIntPref = prefManager.setIntPref,
    setBoolPref = prefManager.setBoolPref;
/**
  * namespace to handle the stored configurations
  */
var prefs = {
  getChar: function(pref) {
      return getCharPref(pref);
  },
  getInt: function(pref) {
      return getIntPref(pref);
  },
  getBool: function(pref) {
      return getBoolPref(pref);
  },
  get: {
    /**
    * @type Int
    */
    checkFreq: function() {
      return getIntPref('extensions.grwatcher.checkfreq');
    },
    /**
    * @type Boolean
    */
    openInNewTab: function() {
      return getBoolPref('extensions.grwatcher.openinnewtab');
    },
    /**
    * @type Boolean
    */
    resetCounter: function() {
      return getBoolPref('extensions.grwatcher.resetcounter');
    },
    /**
    * @type String
    */
    tooltipCounterPos: function() {
      return getCharPref('extensions.grwatcher.tooltipcounterpos');
    },
    /**
    * @type Int
    */
    tooltipTitleLength: function() {
      return getIntPref('extensions.grwatcher.tooltiptitlelength');
    },
    /**
    * @type Boolean
    */
    rememberLogin: function() {
      return getBoolPref('extensions.grwatcher.rememberLogin');
    },
    /**
    * @type Int
    */
    leftClickOpen: function() {
      return getIntPref('extensions.grwatcher.leftclickopen');
    },
    /**
    * @type Boolean
    */
    activateOpenedTab: function() {
      return getBoolPref('extensions.grwatcher.activateopenedtab');
    },
    /**
    * @type Boolean
    */
    showNotificationWindow: function() {
      return getBoolPref('extensions.grwatcher.shownotificationwindow');
    },
    /**
    * @type Boolean
    */
    showZeroCounter: function() {
      return getBoolPref('extensions.grwatcher.showzerocounter');
    },
    /**
    * @type Boolean
    */
    showCounter: function() {
      return getBoolPref('extensions.grwatcher.showcounter');
    },
    /**
    * @type Boolean
    */
    useSecureConnection: function() {
      return getBoolPref('extensions.grwatcher.usesecureconnection');
    },
    /**
    * @type String
    */
    userName: function() {
      return getCharPref('extensions.grwatcher.username');
    },
    /**
    * @type Boolean
    */
    sortByLabels: function() {
      return getBoolPref('extensions.grwatcher.sortbylabels');
    },
    /**
    * @type String
    */
    filteredLabels: function() {
      return getCharPref('extensions.grwatcher.filteredlabels');
    },
    /**
    * @type Boolean
    */
    maximizeCounter: function() {
      return getBoolPref('extensions.grwatcher.maximizecounter');
    },
    /**
    * @type Boolean
    */
    delayStart: function() {
      return getIntPref('extensions.grwatcher.delaystart');
    },
    /**
    * @type Boolean
    */
    forceLogin: function() {
      return getBoolPref('extensions.grwatcher.forcelogin');
    },
    /**
    * @type String
    */
    sid: function() {
      return getCharPref('extensions.grwatcher.sid');
    },
    /**
      * @type Boolean
      */
    showitemsintooltip: function() {
      return getBoolPref('extensions.grwatcher.showitemsintooltip');
    },
    /**
      * @type Boolean
      */
    showitemsincontextmenu: function() {
      return getBoolPref('extensions.grwatcher.showitemsincontextmenu');
    },
    cookieBehaviour: function() {
      return getIntPref('network.cookie.cookieBehavior');
    },
    haveMultipleAccounts: function() {
      return getBoolPref('extensions.grwatcher.havemultipleaccounts');
    },
    debug: function() {
      return getBoolPref('extensions.grwatcher.debug');
    },
    /**
      * @type {String} value
      */
    oauthCode: function() {
      return getCharPref('extensions.grwatcher.oauthcode');
    },
    /**
      * @type {String} value
      */
    oauthRefreshToken: function() {
      return getCharPref('extensions.grwatcher.oauthrefreshtoken');
    }
  },
  set: {
    /**
      * @param {Integer} value
      */
    checkFreq : function(value) {
      setIntPref('extensions.grwatcher.checkfreq', value);
    },
    /**
      * @param {Boolean} value
      */
    openInNewTab : function(value) {
      setBoolPref('extensions.grwatcher.openinnewtab', value);
    },
    /**
      * @param {Boolean} value
      */
    resetCounter : function(value) {
      setBoolPref('extensions.grwatcher.resetcounter', value);
    },
    /**
      * @param {String} value
      */
    tooltipCounterPos : function(value) {
      setCharPref('extensions.grwatcher.tooltipcounterpos', value);
    },
    /**
      * @param {Integer} value
      */
    tooltipTitleLength : function(value) {
      setIntPref('extensions.grwatcher.tooltiptitlelength', value);
    },
    /**
      * @param {Boolean} value
      */
    rememberLogin : function(value) {
      setBoolPref('extensions.grwatcher.rememberLogin', value);
    },
    /**
      * @param {Integer} value
      */
    leftClickOpen : function(value) {
      setIntPref('extensions.grwatcher.leftclickopen', value);
    },
    /**
      * @param {Boolean} value
      */
    activateOpenedTab : function(value) {
      setBoolPref('extensions.grwatcher.activateopenedtab', value);
    },
    /**
      * @param {Boolean} value
      */
    showNotificationWindow : function(value) {
      setBoolPref('extensions.grwatcher.shownotificationwindow', value);
    },
    /**
      * @param {Boolean} value
      */
    showZeroCounter : function(value) {
      setBoolPref('extensions.grwatcher.showzerocounter', value);
    },
    /**
      * @param {Boolean} value
      */
    showCounter : function(value) {
      setBoolPref('extensions.grwatcher.showcounter', value);
    },
    /**
      * @param {Boolean} value
      */
    useSecureConnection : function(value) {
      setBoolPref('extensions.grwatcher.usesecureconnection', value);
    },
    /**
      * @param {String} value
      */
    userName: function(value) {
      setCharPref('extensions.grwatcher.username', value);
    },
    /**
      * @param {Boolean} value
      */
    sortByLabels : function(value) {
      setBoolPref('extensions.grwatcher.sortbylabels', value);
    },
    /**
      * @param {String} value
      */
    filteredLabels : function(value) {
      setCharPref('extensions.grwatcher.filteredlabels', value);
    },
    /**
      * @param {Boolean} value
      */
    maximizeCounter : function(value) {
      setBoolPref('extensions.grwatcher.maximizecounter', value);
    },
    /**
      * @param {String} value
      */
    sid : function(value) {
      setCharPref('extensions.grwatcher.sid', value);
    },
    /**
    * @param {Boolean} value
    */
    forceLogin: function(value) {
      return setBoolPref('extensions.grwatcher.forcelogin', value);
    },
    /**
    * @param {Boolean} value
    */
    delayStart: function(value) {
      value = (value > -1) ? value : 0;
      return setIntPref('extensions.grwatcher.delaystart', value);
    },
    /**
      * @param {Boolean} value
      */
    showitemsintooltip: function(value) {
      return setBoolPref('extensions.grwatcher.showitemsintooltip', value);
    },
    /**
      * @type {Boolean} value
      */
    showitemsincontextmenu: function(value) {
      return setBoolPref('extensions.grwatcher.showitemsincontextmenu', value);
    },
    cookieBehaviour: function(value) {
      return setIntPref('network.cookie.cookieBehavior', value);
    },
    haveMultipleAccounts: function(value) {
      return setBoolPref('extensions.grwatcher.havemultipleaccounts', value);
    },
    /**
      * @type {Boolean} value
      */
    debug: function(value) {
      return setBoolPref('network.cookie.debug', value);
    },
    /**
      * @type {String} value
      */
    oauthCode: function(value) {
      return setCharPref('extensions.grwatcher.oauthcode', value);
    },
    /**
      * @type {String} value
      */
    oauthRefreshToken: function(value) {
      return setCharPref('extensions.grwatcher.oauthrefreshtoken', value);
    }
  }
};
let EXPORTED_SYMBOLS = ['prefs'];
