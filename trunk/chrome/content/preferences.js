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
  timeoutid: -1,
  showNotification: true,
  currentNum: null,
  feeds: null,
  conntype: null,
  /**
   * @type Int
   */
  checkfreq: function() {
    return prefManager.getIntPref('extensions.grwatcher.checkfreq');
  },
  /**
   * @type Boolean
   */
  openinnewtab: function() {
    return prefManager.getBoolPref('extensions.grwatcher.openinnewtab');
  },
  /**
   * @type Boolean
   */
  resetcounter: function() {
    return prefManager.getBoolPref('extensions.grwatcher.resetcounter');
  },
  /**
   * @type String
   */
  tooltipcounterpos: function() {
    return prefManager.getCharPref('extensions.grwatcher.tooltipcounterpos');
  },
  /**
   * @type Int
   */
  tooltiptitlelength: function() {
    return prefManager.getIntPref('extensions.grwatcher.tooltiptitlelength');
  },
  /**
   * @type String
   */
  email: function() {
    return prefManager.getCharPref('extensions.grwatcher.email');
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
  shownotificationwindow: function() {
    return prefManager.getBoolPref('extensions.grwatcher.shownotificationwindow');
  },
  /**
   * @type Boolean
   */
  showzerocounter: function() {
    return prefManager.getBoolPref('extensions.grwatcher.showzerocounter');
  },
  /**
   * @type Boolean
   */
  usersecureconnection: function() {
    return prefManager.getBoolPref('extensions.grwatcher.usesecureconnection');
  },
  /**
   * @type String
   */
  username: function() {
   return prefManager.getCharPref('extensions.grwatcher.username');
  },
  sortbylabels: function() {
   return prefManager.getBoolPref('extensions.grwatcher.sortbylabels');
  }
};


