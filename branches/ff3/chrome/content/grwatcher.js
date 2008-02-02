/**
 * @author Lajos Koszti [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu ajnasz@gmail.com
 * @license GPL v2
 */
/**
 *
 */
var GRCheck = {
  getReaderURL: function() {
    if(!GRPrefs.conntype) {
      GRPrefs.conntype = GRPrefs.usersecureconnection() ? 'https' : 'http';
    }
    return GRPrefs.conntype + '://www.google.com/reader/view';
  },
  /**
   * open the readader window
   */
  openReader: function() {
    this.getReaderURL();
    if(GRPrefs.resetcounter()) {
      if(GRPrefs.showzerocounter() === false) {
        hideCounter();
      }
      else {
        showCounter(0);
      }
      setReaderTooltip('hide');
      GRPrefs.showNotification = true;
      var activeWin = getActiveGRW();
      activeWin.GRPrefs.currentNum = 0;
    }
    this.switchOffIcon();
    var openedGR = this.getOpenedGR();
    /**
     * google reader din't opened yet
     */
    if(openedGR.grTab === false) {
      /**
       * open in new tab
       */
      if(GRPrefs.openinnewtab()) {
        /**
         * isn't there any blank page
         */
        if(openedGR.blankPage === false) {
          if(GRPrefs.activateOpenedTab()) {
            gBrowser.selectedTab = gBrowser.addTab(this.getReaderURL());
          }
          else {
            gBrowser.addTab(this.getReaderURL());
          }
        }
        else {
          /**
           * load the GR into the blank page
           */
          if(GRPrefs.activateOpenedTab()) {
            gBrowser.mTabContainer.selectedIndex = openedGR.blankPage;
            gBrowser.loadURI(this.getReaderURL());

          }
          else {
            gBrowser.getBrowserAtIndex(openedGR.blankPage).loadURI(this.getReaderURL());
          }
        }
      }
      else {
        gBrowser.loadURI(this.getReaderURL());
      }
    }
    else {
      gBrowser.mTabContainer.selectedIndex = openedGR.grTab;
      gBrowser.loadURI(this.getReaderURL());
    }
    var minCheck = 1;
    var configuredCheck = GRPrefs.checkfreq();
    var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
    if(GRPrefs.timeoutid) {
      clearTimeout(GRPrefs.timeoutid);
    }
    GRPrefs.timeoutid = setTimeout(GoogleIt, freq*1000*60);

  },
  /**
   * checks for opened GR window and blank pages
   * @type {Object}
   */
  getOpenedGR: function() {
    var brl = gBrowser.browsers.length, i = 0;
    var outObj = {grTab: false, blankPage: false};
    var r = new RegExp('^'+this.getReaderURL());
    for( ; i < brl; i++) {
      if(r.test(gBrowser.getBrowserAtIndex(i).currentURI.spec)) {
        outObj.grTab = i;
        return outObj;
      }
      else if(gBrowser.getBrowserAtIndex(i).currentURI.spec == 'about:blank' && outObj.blankPage === false) {
        outObj.blankPage = i;
      }
    }
    return outObj;
  },
  /**
   * set the icon to off status
   */
  switchOffIcon: function() {
    setReaderStatus('off');
  },
  /**
   * set the icon to on status
   */
  switchOnIcon: function() {
    setReaderStatus('on');
  },
  /**
   * set the icon to error status
   */
  switchErrorIcon: function() {
    setReaderStatus('error');
  },
  /**
   * set the icon to load status
   */
  switchLoadIcon: function() {
    setReaderStatus('load');
  }
};
var accountManager = {
  // mozilla nsi cookie manager component
  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
  /**
   * @type {Boolean}
   */
  accountExists: function() {
    if(GRPrefs.username() && passwordManager.getPassword()) {
      return true;
    }
    return false;
  },
  /**
   * @return returns the value of the cookie named `SID`
   * @type {String,Boolean}
   */
  getCurrentSID: function() {
    var enumerator = this.CookieManager.enumerator;
    var rex = new RegExp('google.com$');
    while (enumerator.hasMoreElements()) {
      var cookie = enumerator.getNext();
      if (cookie instanceof Components.interfaces.nsICookie) {
        if (rex.test(cookie.host)) {
          if(cookie.name == 'SID' && cookie) {
            return cookie.value;
          }
        }
      }
    }
    return false;
  },
  /**
   * do the login into the google service
   */
  logIn: function() {
    if(this.accountExists()) {
      var url = GRPrefs.conntype + '://www.google.com/accounts/ServiceLoginAuth';
      var param = 'Email='+encodeURIComponent(GRPrefs.username())+'&Passwd='+encodeURIComponent(passwordManager.getPassword())+'&service=reader&continue=http://www.google.com';
      // remember the login state, possible won't ask for mozilla master password
      if(GRPrefs.rememberLogin()) {
        param += '&PersistentCookie=yes';
      }
      // GRCheck.switchLoadIcon();
      loginAjax = new Ajax({
        url: url,
        pars: param,
        method: 'post',
        successHandler: function() {
          var curSid = accountManager.getCurrentSID();
          if(curSid === false) {
            GRCheck.switchErrorIcon();
            setReaderTooltip('loginerror');
            return false;
          }
          prefManager.setCharPref('extensions.grwatcher.sid', curSid);
          getFeedList();
          return true;
        }
      });
    }
    else {
      this.loginFailed();
      return -1;
    }
    return true;
  },
  /**
   * do things when the login failed
   */
  loginFailed: function() {
    GRCheck.switchErrorIcon();
    LOG('login failed');
    return false;
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
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(win.GRW === true) {
      return win;
    }
    // |win| is [Object ChromeWindow] (just like |window|), do something with it
  }
  return window;
};

/**
 * change the statusbar elem status
 * @param {Object} status
 */
var setReaderStatus = function(status) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win, stImage, ttb;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    win.document.getElementById('GRW-statusbar').status = status;
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

};
/**
 * change the reader tooltiptext
 * @param {Object} txt
 * @param {Number} [unr]
 */
var setReaderTooltip = function(t, unr) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    var statusBar = win.document.getElementById('GRW-statusbar');
    var ttb = win.document.getElementById('GRW-toolbar-button');
    if(typeof statusBar == 'undefined') {
      LOG('GRW-statusbar object not found');
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
};
/**
 * hide the counter text
 */
var hideCounter = function() {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    var label = win.document.getElementById('GRW-statusbar-label');
    label.value = '';
    label.crop = 'end';
    label.style.margin = '0'
    label.style.width = '0';
    label.collapsed = true;
  }
};
/**
 *
 */
var getFeedList = function() {
  // GRCheck.switchLoadIcon();
  var getFeedListAjax = new Ajax( {
    url: GRPrefs.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',
    successHandler: function() {
      onFeedListLoad(this.req);
    }
  });
};
/**
 * @param {Object} req ajax response object
 * @type {Array}
 */
var onFeedListLoad = function(r) {
  try {
    var data = eval('('+r.responseText+')').subscriptions;
  }
  catch(e) {
    return false;
  }
  var ids = Array();
  for(var i = 0; i < data.length; i++) {
    ids.push(data[i].id);
  }
  FeedlistIds = ids;
  getReadCounter();
  return ids;
};
/**
 *
 * @param {Object} req FeedsCounter request object
 * @param {Object} prReq Counter request object
 * @type {Object}
 */
var onFeedsCounterLoad = function(req, prReq) {
  if(prReq != false) {
    try {
      var prc = eval('('+prReq.responseText+')');
      prc = prc.unreadcounts;
    }
    catch (e) {
      var prc = false;
    }
  }
  else {
    var prc = false;
  }
  var feeds = Array();
  var unr = feedsCounter(req);
  for(var i = 0; i < unr.length; i++) {
    for(var j = 0; j < prc.length; j++) {
      if(unr[i].id == prc[j].id && prc[j].count > 0) {
        feeds.push({Title: unr[i].title, Id: unr[i].id, Count: prc[j].count})
      }
    }
  }
  // filter the feeds, which aren't in the feedlist
  var outFeeds = Array(), rex;
  var counter = 0;
  for(var i = 0; i < feeds.length; i++) {
    for(var j = 0; j < FeedlistIds.length; j++) {
      rex = new RegExp('^'+FeedlistIds[j]);
      if(FeedlistIds[j] == feeds[i].Id) {
        counter += feeds[i].Count;
        outFeeds.push(feeds[i]);
      }
    }
  }
  return {counter: counter, feeds: outFeeds};
};
/**
 *
 */
var openReaderNotify = {
  /**
   *
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
var showNotification = function(label, value) {
  if(GRPrefs.shownotificationwindow() !== false) {
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
      alertsService.showAlertNotification(image , label, value, true, "", openReaderNotify);
    }
    catch(e) {
      try {
        /**
        * Notifier for Linux
        */
        var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
          .getService(Components.interfaces.nsIWindowWatcher)
          .openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);
          alertWin.arguments = [image, label, value, true, "", 0, openReaderNotify];
          alertWin.setTimeout(function(){alertWin.close()},10000);
      }
      catch(e) {
        LOG(e);
      }
    }
  }
};
/**
 * show the counter text
 * @param {Number} val the number of the unread items
 */
var showCounter = function(val) {
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();

    var label = win.document.getElementById('GRW-statusbar-label');
    label.value = val;
    label.style.width = '';
    label.style.margin = '';
    label.crop = '';
    label.collapsed = false;
    
  }
  if(GRPrefs.showNotification && val != 0) {
    var GRW_bundle = document.getElementById('grwatcher-bundles');
    showNotification(false, GRW_bundle.getFormattedString('notifierMSG', [val]));
    GRPrefs.showNotification = false;
  }
};
/**
 * generate the grid for the tooltip
 * @param {Array} feeds
 * @returns a grid element which is filled with the unread feeds data
 * @type Element
 */
var genStatusGrid = function(feeds) {
  var tt = document.getElementById('GRW-statusbar-tooltip-new');
  GRPrefs.feeds = feeds;
  if(tt.firstChild) {
    tt.removeChild(tt.firstChild);
  }
  // Create grid elements
  var grid = document.createElement('grid');
  var columns = document.createElement('columns');
  var column = document.createElement('column');
  var rows = document.createElement('rows');
  var row = document.createElement('row');
  var label = document.createElement('label');
  var columnc1, columnc2, rowc, labelc1, labelc2;

  // configure the length of the title
  var titlelength = GRPrefs.tooltiptitlelength();
  titlelength = (titlelength > 5) ? titlelength : 5;

  grid.flex = 1;
  grid.id = 'GRW-statusbar-tooltip-grid';
  columnc1 = column.cloneNode(true);
  columnc1.flex = 1;
  columnc2 = column.cloneNode(true);
  feeds.map(
    function(o) {
      /**
       * create cells
       */
      rowc = row.cloneNode(true);
      labelc1 = label.cloneNode(true);
      labelc2 = label.cloneNode(true);
      if(o.Title.length > titlelength) {
        o.Title = o.Title.slice(0, titlelength-3)+'...'
      }
      // set up the counter position
      if(GRPrefs.tooltipcounterpos() == 'left') {
        labelc1.value = o.Count;
        labelc2.value = o.Title;
        labelc1.setAttribute('class', 'counterCol');
      }
      else {
        labelc1.value = o.Title;
        labelc2.value = o.Count;
        labelc2.setAttribute('class', 'counterCol');
      }

      rowc.appendChild(labelc1);
      rowc.appendChild(labelc2);
      rows.appendChild(rowc);
    }
  );
  grid.appendChild(columnc1);
  grid.appendChild(columnc2);
  grid.appendChild(rows);
  tt.appendChild(grid);
  return grid;
};
/**
 *
 * @param {Object} r Ajax response
 * @returns an array with the processed feeds object
 * @type {Array}
 */
var feedsCounter = function(r) {
  try {
    data = eval('('+r.responseText+')');
    data = data.subscriptions;
  }
  catch (e) {
    return false;
  }
  var datai, i, datal = data.length, out = Array();
  for(i = 0; i < datal; i++) {
    datai = data[i];
    out.push({title: datai.title, id: datai.id});
  }
  return out;
};
/**
 *
 * @param {Object} prReq Counter reqest object
 */
var getReadFeedsCounter = function(prReq) {
  // GRCheck.switchLoadIcon();

  getReadFeedsCounterAjax = new Ajax( {
    url: GRPrefs.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',
    successHandler: function() {
      var r = onFeedsCounterLoad(this.req, onunreadCountAjax.req);
      var unr = r.counter;
      GRPrefs.currentNum = unr;
      if(unr === false) {
        setReaderTooltip('error');
        GRCheck.switchErrorIcon();
        // Log.log('unr = false');
        hideCounter();
      }
      else if(unr > 0) {
        setReaderTooltip('new', unr);
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var enumerator = wm.getEnumerator('navigator:browser'), win;
        while(enumerator.hasMoreElements()) {
          win = enumerator.getNext();
          win.genStatusGrid(r.feeds);
        }
        GRCheck.switchOnIcon();
        showCounter(unr);
      }
      else {
        setReaderTooltip('nonew');
        GRCheck.switchOffIcon();
        if(GRPrefs.showzerocounter() === false) {
          hideCounter();
        }
        else {
          showCounter(unr);
        }
        GRPrefs.showNotification = true;
      }
    }
  });
};
/**
 * request for unreaded feeds
 */
var getReadCounter = function() {
  // GRCheck.switchLoadIcon();

  onunreadCountAjax = new Ajax( {
    url: GRPrefs.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
    successHandler: function() {
      getReadFeedsCounter(this.req);
    }
  });
};
/**
 * do the request and process the received data
 * @type {Number}
 */
var GoogleIt = function() {
  GRPrefs.conntype = GRPrefs.usersecureconnection() ? 'https' : 'http';
  var activeWin = getActiveGRW();
  if(activeWin !== window) {
    activeWin.GoogleIt();
    return false;
  }
  if(!accountManager.getCurrentSID()) {
    var login = accountManager.logIn();
  }
  else {
    prefManager.setCharPref('extensions.grwatcher.sid', accountManager.getCurrentSID());
    getFeedList();
  }
  if(login === -1) {
    GRCheck.switchErrorIcon();
  }
  var minCheck = 1;
  var configuredCheck = GRPrefs.checkfreq();
  var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
  if(GRPrefs.timeoutid) {
    clearTimeout(GRPrefs.timeoutid);
  }
  GRPrefs.timeoutid = setTimeout(GoogleIt, freq*1000*60);
  return GRPrefs.timeoutid;
};


/**
 * @var {Object} event
 */
var statusClickHandling = function(ob) {
  this.statusBar = ob;
  if(!this.statusBar) { return; }
  this.st = GRPrefs.leftClickOpen();
  this.observe();
};
statusClickHandling.prototype = {
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
    var st = GRPrefs.leftClickOpen();
    switch(event.button) {
      case 0:
        if((st == 2 && event.type == 'dblclick') || (st == 1 && event.type == 'click')) {
          GRCheck.openReader();
        }
      break;

      case 1:
        GoogleIt();
      break;
    }
  }
};
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @type {Boolean}
 */
var isActiveGRW = function() {
  if(typeof Components == 'undefined') {
    return;
  }
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(win.GRW === true) {
      return true;
    }
    // |win| is [Object ChromeWindow] (just like |window|), do something with it
  }
  return false;
};
/**
 * opens preferences window
 * @param {Object} event
 */
var openPrefs = function(event) {
  window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
};

var windowCloseCheck = {
  observe: function(aSubject, aTopic, aData) {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(windowCloseCheck, "domwindowclosed");
   
    if(typeof Components == 'undefined') {
      return;
    }
    var grw = false;
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(win.GRW === true) {
        grw = true;
      }
      // |win| is [Object ChromeWindow] (just like |window|), do something with it
    }
    if(grw === false) {
      win = wm.getMostRecentWindow('navigator:browser');
      win.GRW = true;
      var minCheck = 1;
      var configuredCheck = GRPrefs.checkfreq();
      var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
      win.GRPrefs.timeoutid = win.setTimeout(win.GoogleIt, freq*1000*60);
    }
  }
}
/**
 * initialization function
 */
var GRWinit = function() {
  LOG('Starting Google Reader Watcher');
  passwordManager = new _passwordManager();
  if(isActiveGRW() === false) {
    window.GRW = true;
    var g = GoogleIt();
  }
  else {
    GRPrefs.conntype = GRPrefs.usersecureconnection() ? 'https' : 'http';
    var activeWin = getActiveGRW();
    var unr = activeWin.GRPrefs.currentNum;
    GRPrefs.showNotification = false;
    if(unr === false) {
      setReaderTooltip('error');
      GRCheck.switchErrorIcon();
      hideCounter();
    }
    else if(unr > 0) {
      setReaderTooltip('new', unr);
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      var enumerator = wm.getEnumerator('navigator:browser'), win;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        win.genStatusGrid(activeWin.GRPrefs.feeds);
      }
      GRCheck.switchOnIcon();
      showCounter(unr);
    }
    else {
      setReaderTooltip('nonew');
      GRCheck.switchOffIcon();
      if(GRPrefs.showzerocounter() === false) {
        hideCounter();
      }
      else {
        showCounter(unr);
      }
    } 
  }
  new statusClickHandling(document.getElementById('GRW-statusbar'));
  if(document.getElementById('GRW-toolbar-button')) {
    new statusClickHandling(document.getElementById('GRW-toolbar-button'));
  }

  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(windowCloseCheck, "domwindowclosed", false);

    LOG('Google Reader Watcher initialized');
};

window.addEventListener('load', GRWinit, false);
