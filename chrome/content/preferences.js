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
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
/**
 * namespace to handle the stored configurations
 */
var GRPrefs = {
  getChar: function(pref) {
      return prefManager.getCharPref(pref);
  },
  getInt: function(pref) {
      return prefManager.getIntPref(pref);
  },
  getBool: function(pref) {
      return prefManager.getBoolPref(pref);
  },
  getPref: {
   /**
    * @type Int
    */
    checkFreq: function() {
      return prefManager.getIntPref('extensions.grwatcher.checkfreq');
    },
   /**
    * @type Boolean
    */
    openInNewTab: function() {
      return prefManager.getBoolPref('extensions.grwatcher.openinnewtab');
    },
   /**
    * @type Boolean
    */
    resetCounter: function() {
      return prefManager.getBoolPref('extensions.grwatcher.resetcounter');
    },
   /**
    * @type String
    */
    tooltipCounterPos: function() {
      return prefManager.getCharPref('extensions.grwatcher.tooltipcounterpos');
    },
   /**
    * @type Int
    */
    tooltipTitleLength: function() {
      return prefManager.getIntPref('extensions.grwatcher.tooltiptitlelength');
    },
   /**
    * @type Boolean
    */
    rememberLogin: function() {
      return prefManager.getBoolPref('extensions.grwatcher.rememberLogin');
    },
   /**
    * @type Int
    */
    leftClickOpen: function() {
      return prefManager.getIntPref('extensions.grwatcher.leftclickopen');
    },
   /**
    * @type Boolean
    */
    activateOpenedTab: function() {
      return prefManager.getBoolPref('extensions.grwatcher.activateopenedtab');
    },
   /**
    * @type Boolean
    */
    showNotificationWindow: function() {
      return prefManager.getBoolPref('extensions.grwatcher.shownotificationwindow');
    },
   /**
    * @type Boolean
    */
    showZeroCounter: function() {
      return prefManager.getBoolPref('extensions.grwatcher.showzerocounter');
    },
   /**
    * @type Boolean
    */
    useSecureConnection: function() {
      return prefManager.getBoolPref('extensions.grwatcher.usesecureconnection');
    },
   /**
    * @type String
    */
    userName: function() {
      return prefManager.getCharPref('extensions.grwatcher.username');
    },
   /**
    * @type Boolean
    */
    sortByLabels: function() {
      return prefManager.getBoolPref('extensions.grwatcher.sortbylabels');
    },
   /**
    * @type String
    */
    filteredLabels: function() {
      return prefManager.getCharPref('extensions.grwatcher.filteredlabels');
    },
   /**
    * @type Boolean
    */
    maximizeCounter: function() {
      return prefManager.getBoolPref('extensions.grwatcher.maximizecounter');
    },
   /**
    * @type Boolean
    */
    delayStart: function() {
      return prefManager.getIntPref('extensions.grwatcher.delaystart');
    },
   /**
    * @type Boolean
    */
    forceLogin: function() {
      return prefManager.getBoolPref('extensions.grwatcher.forcelogin');
    },
   /**
    * @type String
    */
    sid: function() {
      return prefManager.getCharPref('extensions.grwatcher.sid');
    },
    /**
     * @type Boolean
     */
    showitemsintooltip: function() {
      return prefManager.getBoolPref('extensions.grwatcher.showitemsintooltip');
    },
    /**
     * @type Boolean
     */
    showitemsincontextmenu: function() {
      return prefManager.getBoolPref('extensions.grwatcher.showitemsincontextmenu');
    }
  },
  setPref: {
    /**
     * @param {Integer} value
     */
    checkFreq : function(value) {
      prefManager.setIntPref('extensions.grwatcher.checkfreq', value);
    },
    /**
     * @param {Boolean} value
     */
    openInNewTab : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.openinnewtab', value);
    },
    /**
     * @param {Boolean} value
     */
    resetCounter : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.resetcounter', value);
    },
    /**
     * @param {String} value
     */
    tooltipCounterPos : function(value) {
      prefManager.setCharPref('extensions.grwatcher.tooltipcounterpos', value);
    },
    /**
     * @param {Integer} value
     */
    tooltipTitleLength : function(value) {
      prefManager.setIntPref('extensions.grwatcher.tooltiptitlelength', value);
    },
    /**
     * @param {Boolean} value
     */
    rememberLogin : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.rememberLogin', value);
    },
    /**
     * @param {Integer} value
     */
    leftClickOpen : function(value) {
      prefManager.setIntPref('extensions.grwatcher.leftclickopen', value);
    },
    /**
     * @param {Boolean} value
     */
    activateOpenedTab : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.activateopenedtab', value);
    },
    /**
     * @param {Boolean} value
     */
    showNotificationWindow : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.shownotificationwindow', value);
    },
    /**
     * @param {Boolean} value
     */
    showZeroCounter : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.showzerocounter', value);
    },
    /**
     * @param {Boolean} value
     */
    useSecureConnection : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.usesecureconnection', value);
    },
    /**
     * @param {String} value
     */
    userName: function(value) {
      prefManager.setCharPref('extensions.grwatcher.username', value);
    },
    /**
     * @param {Boolean} value
     */
    sortByLabels : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.sortbylabels', value);
    },
    /**
     * @param {String} value
     */
    filteredLabels : function(value) {
      prefManager.setCharPref('extensions.grwatcher.filteredlabels', value);
    },
    /**
     * @param {Boolean} value
     */
    maximizeCounter : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.maximizecounter', value);
    },
    /**
     * @param {String} value
     */
    sid : function(value) {
      prefManager.setCharPref('extensions.grwatcher.sid', value);
    },
   /**
    * @param {Boolean} value
    */
    forceLogin: function(value) {
      return prefManager.setBoolPref('extensions.grwatcher.forcelogin', value);
    },
   /**
    * @param {Boolean} value
    */
    delayStart: function(value) {
      return prefManager.setIntPref('extensions.grwatcher.delaystart', value);
    },
    /**
     * @param {Boolean} value
     */
    showitemsintooltip: function(value) {
      return prefManager.setBoolPref('extensions.grwatcher.showitemsintooltip', value);
    },
    /**
     * @type {Boolean} value
     */
    showitemsincontextmenu: function(value) {
      return prefManager.setBoolPref('extensions.grwatcher.showitemsincontextmenu', value);
    },
    setCookieBehaviour: function(value) {
      return prefManager.setIntPref('network.cookie.cookieBehavior', value);
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
