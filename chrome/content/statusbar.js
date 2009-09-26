/**
 * A class to handle the each status of the statusbar
 * @namespace GRW
 * @class StatusBar
 * @param {XULStatusbarpanelElement} statusbar The GRW statusbarpanel element of a browser window
 */
GRW.StatusBar = function(statusbar) {
  if(statusbar.getAttribute(id) != 'GRW-statusbar') {
    throw new Error('The statusbarpanel element is not a GRW statusbar panel');
  }
  this.statusbar = statusbar;
};
GRW.StatusBar.prototype = {
  /**
   * Sets the statusbar's icon and other properties to the default state
   * @method setDefault
   */
  setDefault: function() {
  },
  /**
   * Sets the statusbar's icon and other properties to the error state
   * sets error message
   * @method setDefault
   * @param {String} errorType
   */
  setError: function(errorType) {
  },
  /**
   * Sets the statusbar's icon and other properties to the new feed state
   * sets tooltip, context menu grid
   * @method setDefault
   * @param {String} errorType
   */
  setNewFeed: function(feeds) {
  },
  /**
   * Sets the statusbar's icon and other properties to the no new feed state
   * @method setDefault
   * @param {String} errorType
   */
  setNoNewFeed: function() {
  }
};

/**
 * @namespace GRW
 * @module Statusbar
 */
GRW.Statusbar = {};
/**
 * Creates a grid for the statusbar icon
 * @namespace
 * @method grid
 */
GRW.Statusbar.grid = function(argument) {
};
/**
 * Creates a grid for the statusbar icon context menu
 * @namespace
 * @method contextGrid
 */
GRW.Statusbar.gcontextGrid= function(argument) {
};
