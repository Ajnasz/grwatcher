/**
 * preferences.js
 *
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license GPL v2
 * for more details see the license.txt file
 */
/**
 * mozilla preferences component service
 */
GRW.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
/**
 * namespace to handle the stored configurations
 */
GRW.Prefs = {
  getChar: function(pref) {
      return GRW.prefManager.getCharPref(pref);
  },
  getInt: function(pref) {
      return GRW.prefManager.getIntPref(pref);
  },
  getBool: function(pref) {
      return GRW.prefManager.getBoolPref(pref);
  },
  getPref: {
   /**
    * @type Int
    */
    checkFreq: function() {
      return GRW.prefManager.getIntPref('extensions.grwatcher.checkfreq');
    },
   /**
    * @type Boolean
    */
    openInNewTab: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.openinnewtab');
    },
   /**
    * @type Boolean
    */
    resetCounter: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.resetcounter');
    },
   /**
    * @type String
    */
    tooltipCounterPos: function() {
      return GRW.prefManager.getCharPref('extensions.grwatcher.tooltipcounterpos');
    },
   /**
    * @type Int
    */
    tooltipTitleLength: function() {
      return GRW.prefManager.getIntPref('extensions.grwatcher.tooltiptitlelength');
    },
   /**
    * @type Boolean
    */
    rememberLogin: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.rememberLogin');
    },
   /**
    * @type Int
    */
    leftClickOpen: function() {
      return GRW.prefManager.getIntPref('extensions.grwatcher.leftclickopen');
    },
   /**
    * @type Boolean
    */
    activateOpenedTab: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.activateopenedtab');
    },
   /**
    * @type Boolean
    */
    showNotificationWindow: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.shownotificationwindow');
    },
   /**
    * @type Boolean
    */
    showZeroCounter: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.showzerocounter');
    },
   /**
    * @type Boolean
    */
    useSecureConnection: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.usesecureconnection');
    },
   /**
    * @type String
    */
    userName: function() {
      return GRW.prefManager.getCharPref('extensions.grwatcher.username');
    },
   /**
    * @type Boolean
    */
    sortByLabels: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.sortbylabels');
    },
   /**
    * @type String
    */
    filteredLabels: function() {
      return GRW.prefManager.getCharPref('extensions.grwatcher.filteredlabels');
    },
   /**
    * @type Boolean
    */
    maximizeCounter: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.maximizecounter');
    },
   /**
    * @type Boolean
    */
    delayStart: function() {
      return GRW.prefManager.getIntPref('extensions.grwatcher.delaystart');
    },
   /**
    * @type Boolean
    */
    forceLogin: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.forcelogin');
    },
   /**
    * @type String
    */
    sid: function() {
      return GRW.prefManager.getCharPref('extensions.grwatcher.sid');
    },
    /**
     * @type Boolean
     */
    showitemsintooltip: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.showitemsintooltip');
    },
    /**
     * @type Boolean
     */
    showitemsincontextmenu: function() {
      return GRW.prefManager.getBoolPref('extensions.grwatcher.showitemsincontextmenu');
    }
  },
  setPref: {
    /**
     * @param {Integer} value
     */
    checkFreq : function(value) {
      GRW.prefManager.setIntPref('extensions.grwatcher.checkfreq', value);
    },
    /**
     * @param {Boolean} value
     */
    openInNewTab : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.openinnewtab', value);
    },
    /**
     * @param {Boolean} value
     */
    resetCounter : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.resetcounter', value);
    },
    /**
     * @param {String} value
     */
    tooltipCounterPos : function(value) {
      GRW.prefManager.setCharPref('extensions.grwatcher.tooltipcounterpos', value);
    },
    /**
     * @param {Integer} value
     */
    tooltipTitleLength : function(value) {
      GRW.prefManager.setIntPref('extensions.grwatcher.tooltiptitlelength', value);
    },
    /**
     * @param {Boolean} value
     */
    rememberLogin : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.rememberLogin', value);
    },
    /**
     * @param {Integer} value
     */
    leftClickOpen : function(value) {
      GRW.prefManager.setIntPref('extensions.grwatcher.leftclickopen', value);
    },
    /**
     * @param {Boolean} value
     */
    activateOpenedTab : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.activateopenedtab', value);
    },
    /**
     * @param {Boolean} value
     */
    showNotificationWindow : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.shownotificationwindow', value);
    },
    /**
     * @param {Boolean} value
     */
    showZeroCounter : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.showzerocounter', value);
    },
    /**
     * @param {Boolean} value
     */
    useSecureConnection : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.usesecureconnection', value);
    },
    /**
     * @param {String} value
     */
    userName: function(value) {
      GRW.prefManager.setCharPref('extensions.grwatcher.username', value);
    },
    /**
     * @param {Boolean} value
     */
    sortByLabels : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.sortbylabels', value);
    },
    /**
     * @param {String} value
     */
    filteredLabels : function(value) {
      GRW.prefManager.setCharPref('extensions.grwatcher.filteredlabels', value);
    },
    /**
     * @param {Boolean} value
     */
    maximizeCounter : function(value) {
      GRW.prefManager.setBoolPref('extensions.grwatcher.maximizecounter', value);
    },
    /**
     * @param {String} value
     */
    sid : function(value) {
      GRW.prefManager.setCharPref('extensions.grwatcher.sid', value);
    },
   /**
    * @param {Boolean} value
    */
    forceLogin: function(value) {
      return GRW.prefManager.setBoolPref('extensions.grwatcher.forcelogin', value);
    },
   /**
    * @param {Boolean} value
    */
    delayStart: function(value) {
      return GRW.prefManager.setIntPref('extensions.grwatcher.delaystart', value);
    },
    /**
     * @param {Boolean} value
     */
    showitemsintooltip: function(value) {
      return GRW.prefManager.setBoolPref('extensions.grwatcher.showitemsintooltip', value);
    },
    /**
     * @type {Boolean} value
     */
    showitemsincontextmenu: function(value) {
      return GRW.prefManager.setBoolPref('extensions.grwatcher.showitemsincontextmenu', value);
    },
    setCookieBehaviour: function(value) {
      return GRW.prefManager.setIntPref('network.cookie.cookieBehavior', value);
    }
  }
};
GRStates = {
  timeoutid: -1,
  showNotification: true,
  currentNum: null,
  feeds: null,
  conntype: null,
  userid: null
}
