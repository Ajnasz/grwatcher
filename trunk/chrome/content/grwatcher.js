/**
 * @author Lajos Koszti [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu ajnasz@gmail.com
 * @license GPL v2
 * @requires chrome/content/grprefs.js
 * @requires chrome/content/ajax.js
 */
/**
 *
 */
var GRCheck = {
  getUserId: function(json) {
    if(!GRStates.userid) {
      var list = new GetList(true);
    }
    return GRStates.userid;
  },
  getReaderURL: function() {
    if(!GRStates.conntype) {
      GRStates.conntype = GRPrefs.getPref.useSecureConnection() ? 'https' : 'http';
    }
    return GRStates.conntype + '://www.google.com/reader/view';
  },
  /**
   * open the readader window
   */
  openReader: function(url) {
    var url = url || '';
    this.getReaderURL();
    if(GRPrefs.getPref.resetCounter()) {
      if(GRPrefs.getPref.showZeroCounter() === false) {
        GRW_StatusBar.hideCounter();
      } else {
        GRW_StatusBar.showCounter(0);
      }
      GRW_StatusBar.setReaderTooltip('hide');
      GRStates.showNotification = true;
      var activeWin = getActiveGRW();
      activeWin.GRStates.currentNum = 0;
    }
    GRW_StatusBar.switchOffIcon();
    var openedGR = this.getOpenedGR();
    /**
     * google reader doesn't opened yet
     */
    if(openedGR.grTab === false) {
      /**
       * open in new tab
       */
      if(GRPrefs.getPref.openInNewTab()) {
        /**
         * isn't there any blank page
         */
        if(openedGR.blankPage === false) {
          if(GRPrefs.getPref.activateOpenedTab()) {
            gBrowser.selectedTab = gBrowser.addTab(this.getReaderURL() + '/' + url);
            gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow.focus();
          } else {
            gBrowser.addTab(this.getReaderURL() + '/' + url);
          }
        } else {
          /**
           * load the GR into the blank page
           */
          if(GRPrefs.getPref.activateOpenedTab()) {
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
    var minCheck = 1;
    var configuredCheck = GRPrefs.getPref.checkFreq();
    var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
    if(GRStates.timeoutid) {
      clearTimeout(GRStates.timeoutid);
    }
    GRStates.timeoutid = setTimeout(GoogleIt, freq*1000*60);
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

var mapWindows = function(onMap) {
  GRW_LOG(onMap.toString());
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win, grid, tt;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(typeof win != 'undefined') {
      onMap(win);
    }
  }
};
var markAllAsRead = function() {
  GRCheck.getUserId();
  this.getToken();
}
markAllAsRead.prototype = {
  token: null,
  getToken: function() {
    var THIS = this;
    new Ajax({
      url: GRStates.conntype + '://www.google.com/reader/api/0/token',
      successHandler: function(request) {
        THIS.token = this.req.responseText;
        THIS.markAsRead();
      }
    });
  },
  markAsRead: function() {
    var THIS = this;
    var parameters = 'T=' + this.token + '&ts=' + (new Date()).getTime() + '999&s=user/' + GRStates.userid  + '/state/com.google/reading-list';
    new Ajax({method: 'post',url: GRStates.conntype + ':www.google.com/reader/api/0/mark-all-as-read?client=scroll',successHandler: function(request) {
        if(this.req.responseText == 'OK') {
          GoogleIt();
        }
      }
    }, parameters);
  }
};

/**
 * @returns the active, recently opened google reader watcher window
 * @type Window
 */
var getActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var activeWin = false;
  mapWindows(function(win) {
    if(win.GRW === true) {
      activeWin = win;
    }
  });
  /*
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(typeof win != 'undefined' && win.GRW === true) {
      return win;
    }
    return false;
    // |win| is [Object ChromeWindow] (just like |window|), do something with it
  }
  */
  return (activeWin === false) ? window : activeWin;
};

var GRW_StatusBar = {
/**
 * change the statusbar elem status
 * @param {Object} status
 */
  setReaderStatus: function(status) {
    var stImage, ttb, statusElem;
    mapWindows(function(win) {
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

        case 'load':
          stImage.src = 'chrome://grwatcher/content/images/loader.gif';
          if(ttb) {
            ttb.setAttribute('class', 'load');
          }
          break;
      }
    });
    /*
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win, stImage, ttb, statusElem;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined') {
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

          case 'load':
            stImage.src = 'chrome://grwatcher/content/images/loader.gif';
            if(ttb) {
              ttb.setAttribute('class', 'load');
            }
            break;
        }
      }
    }
    */
  },
  /**
   * change the reader tooltiptext
   * @param {Object} txt
   * @param {Number} [unr]
   */
  setReaderTooltip: function(t, unr) {
    mapWindows(function(win) {
      var statusBar = win.document.getElementById('GRW-statusbar');
      var ttb = win.document.getElementById('GRW-toolbar-button');
      if(typeof statusBar == 'undefined') {
        GRW_LOG('GRW-statusbar object not found');
      }
      var GRW_bundle = win.document.getElementById('grwatcher-bundles');
      switch(t) {
        case 'error':
          statusBar.tooltip = 'GRW-statusbar-tooltip-error';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW_bundle.getString('errorfeedfetch'));
          }
          break;
        case 'nonew':
        default :
          statusBar.tooltip = 'GRW-statusbar-tooltip-nonew';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW_bundle.getString('nonewfeed'));
          }
          break;
        case 'new':
          statusBar.tooltip = 'GRW-statusbar-tooltip-new';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW_bundle.getFormattedString('notifierMSG', [unr]));
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
            ttb.setAttribute('tooltiptext', GRW_bundle.getString('errorlogin'));
          }
          break;
        case 'networkerror':
          statusBar.tooltip = 'GRW-statusbar-tooltip-networkerror';
          if(ttb) {
            ttb.setAttribute('tooltiptext', GRW_bundle.getString('networkerror'));
          }
          break;
      }
    });
    /*
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined') {
        var statusBar = win.document.getElementById('GRW-statusbar');
        var ttb = win.document.getElementById('GRW-toolbar-button');
        if(typeof statusBar == 'undefined') {
          GRW_LOG('GRW-statusbar object not found');
        }
        var GRW_bundle = win.document.getElementById('grwatcher-bundles');
        switch(t) {
          case 'error':
            statusBar.tooltip = 'GRW-statusbar-tooltip-error';
            if(ttb) {
              ttb.setAttribute('tooltiptext', GRW_bundle.getString('errorfeedfetch'));
            }
            break;
          case 'nonew':
          default :
            statusBar.tooltip = 'GRW-statusbar-tooltip-nonew';
            if(ttb) {
              ttb.setAttribute('tooltiptext', GRW_bundle.getString('nonewfeed'));
            }
            break;
          case 'new':
            statusBar.tooltip = 'GRW-statusbar-tooltip-new';
            if(ttb) {
              ttb.setAttribute('tooltiptext', GRW_bundle.getFormattedString('notifierMSG', [unr]));
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
              ttb.setAttribute('tooltiptext', GRW_bundle.getString('errorlogin'));
            }
            break;
          case 'networkerror':
            statusBar.tooltip = 'GRW-statusbar-tooltip-networkerror';
            if(ttb) {
              ttb.setAttribute('tooltiptext', GRW_bundle.getString('networkerror'));
            }
            break;
        }
      }
    }
    */
  },

  /**
   * hide the counter text
   */
  hideCounter: function() {
    mapWindows(function(win){
      var label = win.document.getElementById('GRW-statusbar-label');
      label.value = '';
      label.crop = 'end';
      label.style.margin = '0'
      label.style.width = '0';
      label.collapsed = true;
    });
    /*
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined') {
      }
    }
    */
  },
/**
 * show the counter text
 * @param {Number} val the number of the unread items
 */
  showCounter: function(val) {
    if(GRPrefs.getPref.maximizeCounter() && GRW_StatusBar.maxCount && val > GRW_StatusBar.maxCount) {
      val = GRW_StatusBar.maxCount + '+';
    }
    mapWindows(function(win){
      var label = win.document.getElementById('GRW-statusbar-label');
      label.value = val;
      label.style.width = '';
      label.style.margin = '';
      label.crop = '';
      label.collapsed = false;
    });
    /*
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined') {
        var label = win.document.getElementById('GRW-statusbar-label');
        label.value = val;
        label.style.width = '';
        label.style.margin = '';
        label.crop = '';
        label.collapsed = false;
      }
    }
    */
    if(GRStates.showNotification && val != 0) {
      var GRW_bundle = document.getElementById('grwatcher-bundles');
      GRW_showNotification(false, GRW_bundle.getFormattedString('notifierMSG', [val]));
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
var GRW_openReaderNotify = {
  /**
   * @param {Object} subject
   * @param {Object} topic
   * @param {Object} data
   */
  observe: function(subject, topic, data) {
    if(topic == 'alertclickcallback') {
      GRCheck.openReader();
    }
  }
};
/**
 * shows the notification window
 * @param {Object} label
 * @param {Object} value
 */
var GRW_showNotification = function(label, value) {
  if(GRPrefs.getPref.showNotificationWindow() !== false) {
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
      alertsService.showAlertNotification(image , label, value, true, "", GRW_openReaderNotify);
    } catch(e) {
      try {
        /**
        * Notifier for Linux
        */
        var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
          .getService(Components.interfaces.nsIWindowWatcher)
          .openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);
          alertWin.arguments = [image, label, value, true, "", 0, GRW_openReaderNotify];
          alertWin.setTimeout(function(){alertWin.close()},10000);
      } catch(e) {
        GRW_LOG(e.message);
      }
    }
  }
};
/**
 * generate the grid for the tooltip
 * @param {Array} feeds
 * @param {String} [class]
 * @param {Boolean} [justRow]
 * @returns a grid element which is filled with the unread feeds data
 * @type Element
 */
var genStatusGrid = function(feeds, class, justRows) {
  GRStates.feeds = feeds;
  this.class = class || '';
  this.justRows = justRows || false;
  this.grid = this.genGrid(this.genRows(feeds));
}
genStatusGrid.prototype = {

  genRows: function(feeds) {
    if(!feeds) { return false; }
    var row = document.createElement('row');
    var label = document.createElement('label');
    var rowsArray = new Array();
    var THIS = this;
    feeds.map(
      function(o) {
        /**
        * create cells
        */
        var rowc = row.cloneNode(true);
        var labelc1 = label.cloneNode(true);
        var labelc2 = label.cloneNode(true);

        // configure the length of the title
        var titlelength = GRPrefs.getPref.tooltipTitleLength();
        titlelength = (titlelength > 5) ? titlelength : 5;
        if(o.Title.length > titlelength) {
          o.Title = o.Title.slice(0, titlelength-3)+'...';
        }
        o.Count = (GRPrefs.getPref.maximizeCounter() && GRW_StatusBar.maxCount && o.Count > GRW_StatusBar.maxCount) ? GRW_StatusBar.maxCount + '+' : o.Count;
        // set up the counter position
        if(GRPrefs.getPref.tooltipCounterPos() == 'left') {
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
          var subRows = THIS.genRows(o.Subs);
          rowsArray = rowsArray.concat(subRows)
        }
      }
    );
    return rowsArray;
  },
  genGrid: function(rowsArray) {
    // Create grid elements
    var grid = document.createElement('grid');
    var columns = document.createElement('columns');
    var column = document.createElement('column');
    var rows = document.createElement('rows');
    var columnc1, columnc2, rowc, labelc1, labelc2;
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
 * @param {Array} feeds
 * @returns a grid element which is filled with the unread feeds data
 * @type Element
 */
var genStatusMenu = function(tm) {
  this.tm = tm;
}
genStatusMenu.prototype = {
  genMenu: function(feeds) {
    if(!feeds) { return false; }
    GRStates.feeds = feeds;
    var menuitem = document.createElement('menuitem'), menuitemc;
    var rowsArray = new Array();
    var THIS = this;
    feeds.map(
      function(o) {
        /**
        * create menu items
        */
        menuitemc = menuitem.cloneNode(true);

        // configure the length of the title
        var titlelength = GRPrefs.getPref.tooltipTitleLength();
        titlelength = (titlelength > 5) ? titlelength : 5;
        if(o.Title.length > titlelength) {
          o.Title = o.Title.slice(0, titlelength-3)+'...';
        }
        o.Count = (GRPrefs.getPref.maximizeCounter() && GRW_StatusBar.maxCount && o.Count > GRW_StatusBar.maxCount) ? GRW_StatusBar.maxCount + '+' : o.Count;
        // set up the counter position
        menuitemc.label = o.Count + ' ' + o.Title;
        menuitemc.setAttribute('url', o.Id);
        menuitemc.setAttribute('class', 'feed');
        menuitemc.addEventListener('command', function(){GRCheck.openReader(this.getAttribute('url'));}, false);
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
  addItems: function(feeds) {
    // Create popup elements
    //var popup = document.createElement('menupopup');
    //popup.setAttribute('class', 'GRW-statusbar-feeds-menu ' + this.class);
    this.clearItems();
    var rowsArray = this.genMenu(feeds);
    var firstChild = this.tm.firstChild;
    var _this = this;
    rowsArray.map(function(o){
      _this.tm.insertBefore(o, firstChild);
    });
  },
  clearItems: function() {
    var removable = new Array();
    for(var i = 0, tl = this.tm.childNodes.length; i < tl; i++) {
      if(/feed|tag/.test(this.tm.childNodes[i].getAttribute('class'))) {
          removable.push(this.tm.childNodes[i]);
      }
    }
    var _this = this;
    removable.map(function(tmc) {_this.tm.removeChild(tmc)});
    return true;
  }
};
/**
 * do the request and process the received data
 * @returns the timeout id which will runs next time the #GoogleIt function
 * @type {Number}
 */
var GoogleIt = function() {
  GRStates.conntype = GRPrefs.getPref.useSecureConnection() ? 'https' : 'http';
  var activeWin = getActiveGRW();
  if(activeWin !== window) {
    activeWin.GoogleIt();
    return false;
  }
  if(!accountManager.getCurrentSID() || GRPrefs.getPref.forceLogin()) {
    var login = accountManager.logIn();
    if(login === -1) {
      GRW_StatusBar.switchErrorIcon();
    }
  } else {
    var list = new GetList();
  }
  var minCheck = 1;
  var configuredCheck = GRPrefs.getPref.checkFreq();
  var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
  if(GRStates.timeoutid) {
    clearTimeout(GRStates.timeoutid);
  }
  GRStates.timeoutid = setTimeout(GoogleIt, freq*1000*60);
  return GRStates.timeoutid;
};
/**
 * @param {Object} event
 */
var GRW_statusClickHandling = function(ob) {
  this.statusBar = ob;
  if(!this.statusBar) { return; }
  this.st = GRPrefs.getPref.leftClickOpen();
  this.observe();
};
GRW_statusClickHandling.prototype = {
  st: null,
  statusBar: null,
  /**
   * add the event handler to the statusbar icon
   */
  observe: function() {
    this.statusBar.addEventListener('click', this.click, false);
    if(this.st == 2) {
      this.statusBar.addEventListener('dblclick', this.click, false);
    }
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
    var st = GRPrefs.getPref.leftClickOpen();
    switch(event.button) {
      case 0:
        if((st == 2 && event.type == 'dblclick') || (st == 1 && event.type == 'click')) {
          if(GRPrefs.getPref.forceLogin()) {
            var login = accountManager.logIn(function(){
                GRCheck.openReader();
            }, true);
            if(login === -1) {
              GRW_StatusBar.switchErrorIcon();
            }
          } else {
            GRCheck.openReader();
          }
        }
      break;

      case 1:
        GoogleIt();
      break;
    }
  }
};
/**
 * @type {Boolean}
 */
var isActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var isActive = false;
  mapWindows(function(win) {
    if(win.GRW === true) {
      isActive = true;
    }
  });
  return isActive;
    /*
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(typeof win != 'undefined' && win.GRW === true) {
      return true;
    }
    // |win| is [Object ChromeWindow] (just like |window|), do something with it
  }
  return false;
  */
};
/**
 * opens preferences window
 * @param {Object} event
 */
var openPrefs = function(event) {
  window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
};

var windowCloseCheck = {
  /**
   * @param {String} aSubject
   * @param {String} aTopic
   * @param {String} aData
   */
  observe: function(aSubject, aTopic, aData) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(windowCloseCheck, "domwindowclosed");

    if(typeof Components == 'undefined') {
      return;
    }
    var grw = false;
    mapWindows(function(win) {
      if(win.GRW === true) {
        grw = true;
      }
    });
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    /*
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(typeof win != 'undefined' && win.GRW === true) {
        grw = true;
      }
      // |win| is [Object ChromeWindow] (just like |window|), do something with it
    }
    */
    if(grw === false) {
      win = wm.getMostRecentWindow('navigator:browser');
      if(typeof win != 'undefined' || !win) {return false;}
      win.GRW = true;
      var minCheck = 1;
      var configuredCheck = GRPrefs.getPref.checkFreq();
      var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
      win.GRStates.timeoutid = win.setTimeout(win.GoogleIt, freq*1000*60);
    }
  }
};
/**
 * initialization function
 */
var GRW_init = function() {
  GRW_LOG('Starting Google Reader Watcher');
  passwordManager = new _passwordManager();
  if(isActiveGRW() === false) {
    window.GRW = true;
    var g;
    setTimeout(function(){
      g = GoogleIt();
    }, GRPrefs.getPref.delayStart());
  } else {
    GRStates.conntype = GRPrefs.getPref.useSecureConnection() ? 'https' : 'http';
    var activeWin = getActiveGRW();
    var unr = activeWin.GRStates.currentNum;
    var maxCount = activeWin.GRW_StatusBar.maxCount;
    GRStates.showNotification = false;
    if(unr === false) {
      GRW_StatusBar.setReaderTooltip('error');
      GRW_StatusBar.switchErrorIcon();
      GRW_StatusBar.hideCounter();
    } else if(unr > 0) {
      GRW_StatusBar.setReaderTooltip('new', unr);
      var grid, tt, pp, tm;
      mapWindows(function(win) {;
          tt = win.document.getElementById('GRW-statusbar-tooltip-new');
          // tm = win.document.getElementById('GRW-open-feeds-menu');
          tm = win.document.getElementById('GRW-statusbar-menu');
          while(tt.firstChild) {
            tt.removeChild(tt.firstChild);
          }
          grid = new win.genStatusGrid(activeWin.GRStates.feeds);
          tt.appendChild(grid.grid);
          var menu = new win.genStatusMenu(tm);
          menu.addItems(activeWin.GRStates.feeds);
      });
      /*
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      var enumerator = wm.getEnumerator('navigator:browser'), win, grid, tt, pp, tm;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();

        if(typeof win != 'undefined') {
          win.GRW_StatusBar.maxCount = maxCount;
          tt = win.document.getElementById('GRW-statusbar-tooltip-new');
          // tm = win.document.getElementById('GRW-open-feeds-menu');
          tm = win.document.getElementById('GRW-statusbar-menu');
          while(tt.firstChild) {
            tt.removeChild(tt.firstChild);
          }
          grid = new win.genStatusGrid(activeWin.GRStates.feeds);
          tt.appendChild(grid.grid);
          var menu = new win.genStatusMenu(tm);
          menu.addItems(activeWin.GRStates.feeds);
        }
      }
      */
      GRW_StatusBar.switchOnIcon();
      GRW_StatusBar.showCounter(unr);
    } else {
      GRW_StatusBar.setReaderTooltip('nonew');
      GRW_StatusBar.switchOffIcon();
      var tm, menu;
      mapWindows(function(win) {
        tm = win.document.getElementById('GRW-statusbar-menu');
        menu = new win.genStatusMenu(tm);
        menu.clearItems();
      });
      /*
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      var enumerator = wm.getEnumerator('navigator:browser'), win, tm, menu;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        if(typeof win != 'undefined') {
          tm = win.document.getElementById('GRW-statusbar-menu');
          menu = new win.genStatusMenu(tm);
          menu.clearItems();
        }
      }
      */
      if(GRPrefs.getPref.showZeroCounter() === false) {
        GRW_StatusBar.hideCounter();
      } else {
        GRW_StatusBar.showCounter(unr);
      }
    }
  }
  new GRW_statusClickHandling(document.getElementById('GRW-statusbar'));
  if(document.getElementById('GRW-toolbar-button')) {
    new GRW_statusClickHandling(document.getElementById('GRW-toolbar-button'));
  }

  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(windowCloseCheck, "domwindowclosed", false);

  GRW_LOG('Google Reader Watcher initialized');
};

window.addEventListener('load', GRW_init, false);
