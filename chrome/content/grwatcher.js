/**
 * @author Lajos Koszti [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu ajnasz@gmail.com
 * @license GPL v2
 * @requires chrome/content/grprefs.js
 * @requires chrome/content/ajax.js
 */
/**
 * Implementation of window.setTimeout with nsiTimer
 * @method setTimeout
 * @param {Function} fn Method to run
 * @param {Integer} timeout
 */
GRW.timeout = function(fn, timeout) {
  var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
  var callback = {notify: fn};
  timer.initWithCallback(callback, timeout, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
  return timer;
};
/**
 * Implementation of window.clearTimeout with nsiTimer
 * @method clrTimeout
 */
GRW.clrTimeout = function(timer) {
  if(timer && typeof timer.cancel == 'function') { timer.cancel(); }
};

/**
 * @namespace GRW
 * @module GRCheck
 */
GRW.GRCheck = {
  getUserId: function(json) {
    if(!GRStates.userid) {
      var list = new GRW.GetList(true);
    }
    return GRStates.userid;
  },
  getReaderURL: function() {
    if(!GRStates.conntype) {
      GRStates.conntype = GRW.Prefs.getPref.useSecureConnection() ? 'https' : 'http';
    }
    return GRStates.conntype + '://www.google.com/reader/view';
  },
  /**
   * open the readader window
   */
  openReader: function(url) {
    var url = url || '';
    this.getReaderURL();
    if(GRW.Prefs.getPref.resetCounter()) {
      if(GRW.Prefs.getPref.showZeroCounter() === false) {
        GRW.StatusBar.hideCounter();
      } else {
        GRW.StatusBar.showCounter(0);
      }
      GRW.StatusBar.setReaderTooltip('hide');
      GRStates.showNotification = true;
      var activeWin = GRW.getActiveGRW();
      activeWin.GRStates.currentNum = 0;
    }
    GRW.StatusBar.switchOffIcon();
    var openedGR = this.getOpenedGR();
    /**
     * google reader doesn't opened yet
     */
    if(openedGR.grTab === false) {
      /**
       * open in new tab
       */
      if(GRW.Prefs.getPref.openInNewTab()) {
        /**
         * isn't there any blank page
         */
        if(openedGR.blankPage === false) {
          if(GRW.Prefs.getPref.activateOpenedTab()) {
            gBrowser.selectedTab = gBrowser.addTab(this.getReaderURL() + '/' + url);
            gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
          } else {
            gBrowser.addTab(this.getReaderURL() + '/' + url);
          }
        } else {
          /**
           * load the GR into the blank page
           */
          if(GRW.Prefs.getPref.activateOpenedTab()) {
            gBrowser.mTabContainer.selectedIndex = openedGR.blankPage;
            gBrowser.loadURI(this.getReaderURL() + '/' + url);
            gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
          } else {
            gBrowser.getBrowserAtIndex(openedGR.blankPage).loadURI(this.getReaderURL() + '/' + url);
          }
        }
      } else {
        gBrowser.loadURI(this.getReaderURL() + '/' + url);
      }
    } else {
      gBrowser.mTabContainer.selectedIndex = openedGR.grTab;
      gBrowser.loadURI(this.getReaderURL() + '/' + url);
    }
    var minCheck = 1,
    configuredCheck = GRW.Prefs.getPref.checkFreq(),
    freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
    GRW.clrTimeout(GRStates.timeoutid);
    GRStates.timeoutid = GRW.timeout(GRW.GoogleIt, freq*1000*60);
  },
  /**
   * checks for opened GR window and blank pages
   * @type {Object}
   */
  getOpenedGR: function() {
    var brl = gBrowser.browsers.length;
    var outObj = {grTab: false, blankPage: false};
    var r = new RegExp('^'+this.getReaderURL());
    for(var i = 0 ; i < brl; i++) {
      if(r.test(gBrowser.getBrowserAtIndex(i).currentURI.spec)) {
        outObj.grTab = i;
        return outObj;
      } else if(gBrowser.getBrowserAtIndex(i).currentURI.spec == 'about:blank' && outObj.blankPage === false) {
        outObj.blankPage = i;
      }
    }
    return outObj;
  }
};
/**
 * Run the given parameter for every window
 * @param {Function} onMap A function which should run for every opened window
 */
GRW.mapWindows = function(onMap) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win, grid, tt;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(typeof win != 'undefined') {
      onMap(win);
    }
  }
};
GRW.Token = function(fn, arg, thisArg, force) {
  var runFn = function(fn, arg) {
    if(typeof fn == 'function') fn.call(thisArg || this, arg);
  }
  var update = function(fn, arg) {
    new GRW.Ajax({
      url: GRStates.conntype + '://www.google.com/reader/api/0/token',
      successHandler: function(r) {
        GRW.setCookie('T', r.responseText);
        GRW.token = {
          token: r.responseText,
          date: new Date()
        }
        runFn(fn, arg)
      }
    });
  };
  var isValid = function() {
    return !(!GRW.token || !GRW.token.date || Math.round(((new Date()).getTime() - GRW.token.date.getTime())/1000/60) > 5 );
  };
  var get = function() {
    if(this.isValid()) {
      return GRW.token.token;
    }
    return null;
  };
  if(!isValid() || force) {
    update(fn, arg);
    return;
  }
  runFn(fn, arg)
};
GRW.setCookie = function(name, value, permanent) {
  if(permanent) {
    new GRW.Cookie('.google.com', name, value, new Date(new Date().setFullYear(new Date().getFullYear()+10)));
  } else {
    new GRW.Cookie('.google.com', name, value);
  }
};
GRW.markAllAsRead = function() {
  if(confirm(GRW.strings.getString('confirmmarkallasread'))) {
    GRW.GRCheck.getUserId();
    var _this = this;
    GRW.Token(this.markAllAsRead(), null, this, true);
  }
};
GRW.markAllAsRead.prototype = {
  markAsRead: function() {
    var THIS = this;
    var parameters = 'T=' + GRW.token.token + '&ts=' + (new Date()).getTime() + '999&s=user/' + GRStates.userid  + '/state/com.google/reading-list';
    new GRW.Ajax({
      method: 'post',
      url: GRStates.conntype + ':www.google.com/reader/api/0/mark-all-as-read?client=scroll',
      successHandler: function(request) {
        if(this.req.responseText == 'OK') {
          GRW.GoogleIt();
        }
      }
    }, parameters);
  }
};
/**
 * @returns the active, recently opened google reader watcher window
 * @type Window
 */
GRW.getActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var activeWin = false;
  GRW.mapWindows(function(win) {
    if(win.GRWActive === true) {
      activeWin = win;
    }
  });
  return (activeWin === false) ? window : activeWin;
};
GRW.StatusBar = {
/**
 * change the statusbar elem status
 * @param {Object} status
 */
  setReaderStatus: function(status) {
    var stImage, ttb, statusElem;
    GRW.mapWindows(function(win) {
      statusElem = win.document.getElementById('GRW-statusbar');
      if(!statusElem) { return; }
      statusElem.status = status;
      stImage = win.document.getElementById('GRW-statusbar-image');
      ttb = win.document.getElementById('GRW-toolbar-button');
      switch(status) {
        case 'on':
          stImage.src = 'chrome://grwatcher/content/images/googlereader.png';
          if(ttb) {
            ttb.setAttribute('class', 'on');
          }
          break;

        case 'off':
        default:
          stImage.src = 'chrome://grwatcher/content/images/googlereader_grey.png';
          if(ttb) {
            ttb.setAttribute('class', 'off');
          }
          break;

        case 'error':
          stImage.src = 'chrome://grwatcher/content/images/googlereader_red.png';
          if(ttb) {
            ttb.setAttribute('class', 'error');
          }
          break;

        case 'cookieerror':
          stImage.src = 'chrome://grwatcher/content/images/googlereader_red.png';
          if(ttb) {
            ttb.setAttribute('class', 'error');
          }
          break;

        case 'load':
          stImage.src = 'chrome://grwatcher/content/images/loader.gif';
          if(ttb) {
            ttb.setAttribute('class', 'load');
          }
          break;
      }
    });
  },
  /**
   * change the reader tooltiptext
   * @param {Object} txt
   * @param {Number} [unr]
   */
  setReaderTooltip: function(t, unr) {
    GRW.mapWindows(function(win) {
      var statusBar = win.document.getElementById('GRW-statusbar');
      var ttb = win.document.getElementById('GRW-toolbar-button');
      if(typeof statusBar == 'undefined') {
        GRW.log('GRW-statusbar object not found');
      }
      // var GRW.strings = win.document.getElementById('grwatcher-bundles');
      switch(t) {
        case 'error':
          statusBar.tooltip = 'GRW-statusbar-tooltip-error';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW.strings.getString('errorfeedfetch'));
          }
          break;
        case 'nonew':
        default :
          statusBar.tooltip = 'GRW-statusbar-tooltip-nonew';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW.strings.getString('nonewfeed'));
          }
          break;
        case 'new':
          statusBar.tooltip = 'GRW-statusbar-tooltip-new';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW.strings.getFormattedString('notifierMSG', [unr]));
          }
          break;
        case 'hide':
          statusBar.tooltip = '';
          if(ttb) {
            ttb.removeAttribute('tooltiptext');
          }
          break;
        case 'loginerror':
          statusBar.tooltip = 'GRW-statusbar-tooltip-loginerror';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW.strings.getString('errorlogin'));
          }
          break;
        case 'networkerror':
          statusBar.tooltip = 'GRW-statusbar-tooltip-networkerror';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW.strings.getString('networkerror'));
          }
          break;
        case 'cookieerror':
          statusBar.tooltip = 'GRW-statusbar-tooltip-cookieerror';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW.strings.getString('cookieerror'));
          }
          break;
        
      }
    });
  },

  /**
   * hide the counter text
   */
  hideCounter: function() {
    GRW.mapWindows(function(win){
      var label = win.document.getElementById('GRW-statusbar-label');
      label.value = '';
      label.crop = 'end';
      label.style.margin = '0'
      label.style.width = '0';
      label.collapsed = true;
    });
  },
/**
 * show the counter text
 * @param {Number} val the number of the unread items
 */
  showCounter: function(val) {
    if(GRW.Prefs.getPref.maximizeCounter() && GRW.StatusBar.maxCount && val > GRW.StatusBar.maxCount) {
      val = GRW.StatusBar.maxCount + '+';
    }
    GRW.mapWindows(function(win){
      var label = win.document.getElementById('GRW-statusbar-label');
      label.value = val;
      label.style.width = '';
      label.style.margin = '';
      label.crop = '';
      label.collapsed = false;
    });
    if(GRStates.showNotification && val != 0) {
      GRW.showNotification(false, GRW.strings.getFormattedString('notifierMSG', [val]));
      GRStates.showNotification = false;
    }
  },
  /**
   * set the icon to off status
   */
  switchOffIcon: function() {
    this.setReaderStatus('off');
  },
  /**
   * set the icon to on status
   */
  switchOnIcon: function() {
    this.setReaderStatus('on');
  },
  /**
   * set the icon to error status
   */
  switchErrorIcon: function() {
    this.setReaderStatus('error');
  },
  /**
   * set the icon to load status
   */
  switchLoadIcon: function() {
    this.setReaderStatus('load');
  }
};
/**
 *
 */
GRW.openReaderNotify = {
  /**
   * @param {Object} subject
   * @param {Object} topic
   * @param {Object} data
   */
  observe: function(subject, topic, data) {
    if(topic == 'alertclickcallback') {
      GRW.GRCheck.openReader();
    }
  }
};
/**
 * shows the notification window
 * @param {Object} label
 * @param {Object} value
 */
GRW.showNotification = function(label, value) {
  if(GRW.Prefs.getPref.showNotificationWindow() !== false) {
    if(!label) {
      label = 'Google Reader Watcher';
    }
    if(!value) {
      value = 'Google Reader Watcher Notification';
    }
    var image = "chrome://grwatcher/skin/grwatcher.png";
    try {
      /**
      * Notifier for Windows
      */
      var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
      alertsService.showAlertNotification(image , label, value, true, "", GRW.openReaderNotify);
    } catch(e) {
      try {
        /**
        * Notifier for Linux
        */
        var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
          .getService(Components.interfaces.nsIWindowWatcher)
          .openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);
          alertWin.arguments = [image, label, value, true, "", 0, GRW.openReaderNotify];
          GRW.timeout(function(){alertWin.close()},10000)
          // alertWin.setTimeout(function(){alertWin.close()},10000);
      } catch(e) {
        GRW.log(e.message);
      }
    }
  }
};
/**
 * generate the grid for the tooltip
 * @constructor
 * @param {Array} feeds
 * @param {String} [class]
 * @param {Boolean} [justRow]
 * @returns a grid element which is filled with the unread feeds data
 * @type Element
 */
GRW.GenStatusGrid = function(feeds, class, justRows) {
  GRStates.feeds = feeds;
  this.class = class || '';
  this.justRows = justRows || false;
  this.grid = GRW.Prefs.getPref.showitemsintooltip() ? this.genGrid(this.genRows(feeds)) : false;

}
GRW.GenStatusGrid.prototype = {

  genRows: function(feeds) {
    if(!feeds) { return false; }
    var row = document.createElement('row'),
    label = document.createElement('label'),
    rowsArray = new Array(),
    THIS = this;

    feeds.forEach(
      function(o) {
        /**
        * create cells
        */
        var rowc = row.cloneNode(true), labelc1 = label.cloneNode(true), labelc2 = label.cloneNode(true),

        // configure the length of the title
        titlelength = GRW.Prefs.getPref.tooltipTitleLength();

        titlelength = (titlelength > 5) ? titlelength : 5;
        if(o.Title.length > titlelength) {
          o.Title = o.Title.slice(0, titlelength-3)+'...';
        }
        o.Count = (GRW.Prefs.getPref.maximizeCounter() && GRW.StatusBar.maxCount && o.Count > GRW.StatusBar.maxCount) ? GRW.StatusBar.maxCount + '+' : o.Count;
        // set up the counter position
        if(GRW.Prefs.getPref.tooltipCounterPos() == 'left') {
          labelc1.value = o.Count;
          labelc2.value = o.Title;
          labelc1.setAttribute('class', 'counterCol');
        } else {
          labelc1.value = o.Title;
          labelc2.value = o.Count;
          labelc2.setAttribute('class', 'counterCol');
        }

        rowc.appendChild(labelc1);
        rowc.appendChild(labelc2);
        rowsArray.push(rowc);
        if(o.Subs) {
          rowc.setAttribute('class', 'tag');
          if(o.Title == '-') {
            rowc.setAttribute('class', 'notitle tag');
          }
          rowsArray = rowsArray.concat(THIS.genRows(o.Subs))
        }
      }
    );
    return rowsArray;
  },
  genGrid: function(rowsArray) {
    // Create grid elements
    var grid = document.createElement('grid'),
    columns = document.createElement('columns'),
    column = document.createElement('column'),
    rows = document.createElement('rows'),
    columnc1, columnc2, rowc, labelc1, labelc2;
    grid.flex = 1;
    grid.setAttribute('class', 'GRW-statusbar-tooltip-grid ' + this.class)
    grid.id = '';
    columnc1 = column.cloneNode(true);
    columnc1.flex = 1;
    columnc2 = column.cloneNode(true);
    rowsArray.map(function(o){
      rows.appendChild(o);
    });
    grid.appendChild(columnc1);
    grid.appendChild(columnc2);
    grid.appendChild(rows);

    return grid;
  }
};
/**
 * generate a menu item instead of the tooltip
 * @param {Element} tm statusbar menu element where the new items should be inserted
 * @returns a grid element which is filled with the unread feeds data
 * @type Element
 */
GRW.GenStatusMenu = function(win, feeds) {
  this.tm = win.document.getElementById('GRW-statusbar-menu');
  this.feeds = GRStates.feeds = feeds;
}
GRW.GenStatusMenu.prototype = {
  genMenu: function(feeds) {
    if(!feeds) { return false; }
    var menuitem = document.createElement('menuitem'), menuitemc;
    var rowsArray = new Array();
    var THIS = this;
    feeds.forEach(
      function(o) {
        /**
        * create menu items
        */
        menuitemc = menuitem.cloneNode(true);

        // configure the length of the title
        var titlelength = GRW.Prefs.getPref.tooltipTitleLength();
        titlelength = (titlelength > 5) ? titlelength : 5;
        if(o.Title.length > titlelength) {
          o.Title = o.Title.slice(0, titlelength-3)+'...';
        }
        o.Count = (GRW.Prefs.getPref.maximizeCounter() && GRW.StatusBar.maxCount && o.Count > GRW.StatusBar.maxCount) ? GRW.StatusBar.maxCount + '+' : o.Count;
        // set up the counter position
        menuitemc.label = o.Count + ' ' + o.Title;
        menuitemc.setAttribute('url', o.Id);
        menuitemc.setAttribute('class', 'feed');
        menuitemc.addEventListener('command', function(){GRW.GRCheck.openReader(this.getAttribute('url'));}, false);
        rowsArray.push(menuitemc);
        if(o.Subs) {
          menuitemc.setAttribute('class', 'tag');
          if(o.Title == '-') {
            menuitemc.setAttribute('class', 'notitle tag');
          }
          var subRows = THIS.genMenu(o.Subs);
          rowsArray = rowsArray.concat(subRows);
        }
      }
    );
    return rowsArray;
  },
  addItems: function() {
    if(GRW.Prefs.getPref.showitemsincontextmenu()) {
      // Create popup elements
      //var popup = document.createElement('menupopup');
      //popup.setAttribute('class', 'GRW-statusbar-feeds-menu ' + this.class);
      this.clearItems();
      var rowsArray = this.genMenu(this.feeds);
      if(rowsArray.length > 0) {
        this.showHideSeparator(false);
        var firstChild = this.tm.firstChild;
        var _this = this;
        rowsArray.forEach(function(o){
          _this.tm.insertBefore(o, firstChild);
        });
      } else {
        this.showHideSeparator(true);
      }
    }
  },
  clearItems: function() {
    var removable = new Array();
    for(var i = 0, tl = this.tm.childNodes.length; i < tl; i++) {
      if(/feed|tag/.test(this.tm.childNodes[i].getAttribute('class'))) {
          removable.push(this.tm.childNodes[i]);
      }
    }
    var _this = this;
    removable.forEach(function(tmc) {_this.tm.removeChild(tmc)});
    return true;
  },
  /**
   * shows or hides the menu separator in the right click menu
   * @param {Boolean} [hide] set to true if you want to hide the menuseparator element
   */
  showHideSeparator: function(hide) {
    var separator = this.tm.getElementsByTagName('menuseparator');
    if(separator.length) {
      if(hide) {
        separator[0].setAttribute('class', 'grw-hidden');
      } else {
        separator[0].setAttribute('class', '');
      }
    }
  }
};
/**
 * do the request and process the received data
 * @returns the timeout id which will runs next time the #GRW.GoogleIt function
 * @type {Number}
 */
GRW.GoogleIt = function() {
  GRStates.conntype = GRW.Prefs.getPref.useSecureConnection() ? 'https' : 'http';
  var activeWin = GRW.getActiveGRW();
  if(activeWin !== window) {
    activeWin.GRW.GoogleIt();
    return false;
  }
  if(!GRW.AccountManager.getCurrentSID() || GRW.Prefs.getPref.forceLogin()) {
    var login = GRW.AccountManager.logIn();
    if(login === -1) {
      GRW.StatusBar.switchErrorIcon();
    }
  } else {
    var list = new GRW.GetList();
  }
  var minCheck = 1,
  configuredCheck = GRW.Prefs.getPref.checkFreq(),
  freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
  GRW.clrTimeout(GRStates.timeoutid);
  GRStates.timeoutid = GRW.timeout(GRW.GoogleIt, freq*1000*60);
  return GRStates.timeoutid;
};
/**
 * @param {Object} event
 */
GRW.statusClickHandling = function(ob) {
  this.ob = ob;
  if(!this.ob || !this.ob.length) {GRW.log('no ob'); return; }
  this.st = GRW.Prefs.getPref.leftClickOpen();
  this.observe();
};
GRW.statusClickHandling.prototype = {
  st: null,
  ob: null,
  /**
   * add the event handler to the statusbar icon
   */
  observe: function() {
    var _this = this;
    this.ob.forEach(function(element){
      if(element) element.addEventListener('click', function(event){_this.click(event)}, true);
      if(_this.st == 2) {
        element.addEventListener('dblclick', function(event){_this.click(event)}, true);
      }
    })
  },
  /**
   * event handler runs when user click on the statusbar icon
   * event.button:
   *   0 = left click
   *   1 = middle click
   *   2 = right click
   * @param {Object} event
   */
  click: function(event) {
    var st = GRW.Prefs.getPref.leftClickOpen(),
    originalClicked = false;
    this.ob.forEach(function(element){
      if(event.originalTarget == element) {originalClicked = true;}
    });
    if(!originalClicked) return;
    switch(event.button) {
      case 0:
        if((st == 2 && event.type == 'dblclick') || (st == 1 && event.type == 'click')) {
          if(GRW.Prefs.getPref.forceLogin()) {
            var login = GRW.AccountManager.logIn(function(){
                GRW.GRCheck.openReader();
            }, true);
            if(login === -1) {
              GRW.StatusBar.switchErrorIcon();
            }
          } else {
            GRW.GRCheck.openReader();
          }
        }
      break;

      case 1:
        GRW.GoogleIt();
      break;
    }
  }
};
/**
 * @type {Boolean}
 */
GRW.isActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var isActive = false;
  GRW.mapWindows(function(win) {
    if(win.GRWActive === true) {
      isActive = true;
    }
  });
  return isActive;
};
/**
 * opens preferences window
 * @param {Object} event
 */
GRW.openPrefs = function(event) {
  window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
};
GRW.enableCookies = function(event) {
  if(confirm('Would you like to enable third party cookies?')) {
    GRW.Prefs.setPref.setCookieBehaviour(0);
    GRW.GoogleIt();
  }
}
GRW.windowCloseCheck = {
  /**
   * @param {String} aSubject
   * @param {String} aTopic
   * @param {String} aData
   */
  observe: function(aSubject, aTopic, aData) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(GRW.windowCloseCheck, "domwindowclosed");

    if(typeof Components == 'undefined') {
      return;
    }
    var grw = false;
    GRW.mapWindows(function(win) {
      if(win.GRW === true) {
        grw = true;
      }
    });
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    if(grw === false) {
      win = wm.getMostRecentWindow('navigator:browser');
      if(typeof win != 'undefined' || !win) {return false;}
      win.GRW = true;
      var minCheck = 1,
      configuredCheck = GRW.Prefs.getPref.checkFreq(),
      freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
      win.GRStates.timeoutid = GRW.timeout(win.GRW.GoogleIt, freq*1000*60);
    }
  }
};
/**
 * initialization function
 */
GRW.init = function() {
  GRW.log('Starting Google Reader Watcher');
  GRW.strings = document.getElementById('grwatcher-strings');
  GRW.PasswordManager = new GRW._PasswordManager();
  if(GRW.isActiveGRW() === false) {
    window.GRWActive = true;
    var g;
    GRW.timeout(function(){
      g = GRW.GoogleIt();
    }, GRW.Prefs.getPref.delayStart());
  } else {
    GRStates.conntype = GRW.Prefs.getPref.useSecureConnection() ? 'https' : 'http';
    var activeWin = GRW.getActiveGRW();
    var unr = activeWin.GRStates.currentNum;
    var maxCount = activeWin.GRW.StatusBar.maxCount;
    GRStates.showNotification = false;
    if(unr === false) {
      GRW.StatusBar.setReaderTooltip('error');
      GRW.StatusBar.switchErrorIcon();
      GRW.StatusBar.hideCounter();
    } else if(unr > 0) {
      GRW.StatusBar.setReaderTooltip('new', unr);
      var grid, tt;
      GRW.mapWindows(function(win) {
        tt = win.document.getElementById('GRW-statusbar-tooltip-new');
        while(tt.firstChild) {
          tt.removeChild(tt.firstChild);
        }
        grid = new win.GRW.GenStatusGrid(activeWin.GRStates.feeds);
        if(grid.grid) tt.appendChild(grid.grid);
        var menu = new win.GRW.GenStatusMenu(win, activeWin.GRStates.feeds);
        menu.addItems();
      });
      delete grid, tt;
      GRW.StatusBar.switchOnIcon();
      GRW.StatusBar.showCounter(unr);
    } else {
      GRW.StatusBar.setReaderTooltip('nonew');
      GRW.StatusBar.switchOffIcon();
      var tm, menu;
      GRW.mapWindows(function(win) {
        menu = new win.GRW.GenStatusMenu(win);
        menu.clearItems();
      });
      if(GRW.Prefs.getPref.showZeroCounter() === false) {
        GRW.StatusBar.hideCounter();
      } else {
        GRW.StatusBar.showCounter(unr);
      }
    }
  }
  new GRW.statusClickHandling([document.getElementById('GRW-statusbar'), document.getElementById('GRW-toolbar-button')]);

  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(GRW.windowCloseCheck, "domwindowclosed", false);

  GRW.log('Google Reader Watcher initialized');
};
window.addEventListener('load', GRW.init, false);
window.addEventListener('unload', function(event) {
  this.removeEventListener('load', GRW.init, false);
}, false);
