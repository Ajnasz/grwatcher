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
    }
  },
  setPref: {
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
    userName: function(value) {
      prefManager.setCharPref('extensions.grwatcher.username', value);
    },
    sortByLabels : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.sortbylabels', value);
    },
    filteredLabels : function(value) {
      prefManager.setCharPref('extensions.grwatcher.filteredlabels', value);
    },
    maximizeCounter : function(value) {
      prefManager.setBoolPref('extensions.grwatcher.maximizecounter', value);
    },
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
