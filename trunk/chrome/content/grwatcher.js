/**
 * @author Lajos Koszti [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu ajnasz@gmail.com
 * @license GPL v2
 */
/**
 * mozilla preferences component service
 */
var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
/**
 * user agent for Google Reader Watcher
 */
var GRWUserAgent = 'Google Reader Watcher 0.0.9';
/**
 * @param {String} message log on the javascript console
 */
var Log =
{
  // mozilla log service
  serv: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
  /**
   * @param {String} message
   */
  log: function(message){
    this.serv.logStringMessage('GRW: '+message);
  }
};
FeedlistIds = Array();
/**
 * passwod manager object
 */
var passManager =
{
  // mozilla nsi password manager internal component
  passwordManagerInternal: Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManagerInternal),
  // mozilla nsi password manager component
  passwordManager: Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManager),
  url: "https://www.google.com",

  /**
   * @param {String} username
   * @param {String} password
   */
  setUser: function(username, password)
  {
    var url = this.url
    try
    {
      this.passwordManager.removeUser(url, username);
    }
    catch(e)
    {}
    try
    {
      this.passwordManagerInternal.addUserFull(url, username, password, "", "");
    }
    catch(e)
    {}
  },
  /**
   * Returns the password value
   * @return {String}
   */
  getPassword: function()
  {
    var url = this.url;
    var host = {value:""};
    var user =  {value:""};
    var password = {value:""};
    try
    {
      this.passwordManagerInternal.findPasswordEntry(url, "", "", host, user, password);
    }
    catch(e)
    {}
    return password.value;
  },
  /**
   * Returns the username value
   * @return {String}
   */
  getUserName: function()
  {
    var url = this.url;
    var host = {value: ""};
    var user =  {value: ""};
    var password = {value: ""};
    try
    {
      this.passwordManagerInternal.findPasswordEntry(url, "", "", host, user, password);
    }
    catch(e)
    {}
    return user.value;
  }
};
/**
 * account manager object
 */
var accountManager =
{
  // mozilla nsi cookie manager component
  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
  /**
   * @return {Boolean}
   */
  accountExists: function()
  {
    if(passManager.getUserName() && passManager.getPassword())
    {
      return true;
    }
    return false;
  },
  /**
   * @return {String,Boolen} returns the value of the cookie named `SID`
   */
  getCurrentSID: function()
  {
    var enumerator = this.CookieManager.enumerator;
    while (enumerator.hasMoreElements())
    {
      var cookie = enumerator.getNext();
      if (cookie instanceof Components.interfaces.nsICookie)
      {
        if (cookie.host.match("google.com"))
        {
          if(cookie.name == 'SID')
          {
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
  logIn: function()
  {
    if(this.accountExists())
    {
      var url = 'https://www.google.com/accounts/ServiceLoginAuth';
      var param = 'Email='+encodeURIComponent(passManager.getUserName())+'&Passwd='+encodeURIComponent(passManager.getPassword())+'&service=reader&continue=http://www.google.com';
      // remember the login state, possible won't ask for mozilla master password
      if(GRPrefs.rememberLogin())
      {
        param += '&PersistentCookie=yes';
      }
      // GRCheck.switchLoadIcon();
      loginAjax = new Ajax({
        url: url,
        pars: param,
        method: 'post',
        successHandler: function()
        {
          var curSid = accountManager.getCurrentSID();
          if(!curSid)
          {
            GRCheck.switchErrorIcon();
            setReaderTooltip('loginerror');
            return false;
          }
          prefManager.setCharPref('extensions.grwatcher.sid', curSid);
          getFeedList();
        }
      });
    }
    else
    {
      this.loginFailed();
      return -1;
    }
  },
  /**
   * do things when the login failed
   */
  loginFailed: function()
  {
    GRCheck.switchErrorIcon();
    Log.log('login failed');
    return false;
  }
};
/**
 *
 */
var GRCheck =
{
  readerURL: 'https://www.google.com/reader/view',
  /**
   * open the readader window
   */
  openReader: function()
  {
    if(GRPrefs.resetcounter())
    {
      hideCounter();
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
    if(openedGR.grTab === false)
    {
      /**
       * open in new tab
       */
      if(GRPrefs.openinnewtab())
      {
        /**
         * isn't there any blank page
         */
        if(openedGR.blankPage === false)
        {
          if(GRPrefs.activateOpenedTab())
          {
            gBrowser.selectedTab = gBrowser.addTab(this.readerURL);
          }
          else
          {
            gBrowser.addTab(this.readerURL);
          }
        }
        else
        {
          /**
           * load the GR into the blank page
           */
          if(GRPrefs.activateOpenedTab())
          {
            gBrowser.mTabContainer.selectedIndex = openedGR.blankPage;
            gBrowser.loadURI(this.readerURL);

          }
          else
          {
            gBrowser.getBrowserAtIndex(openedGR.blankPage).loadURI(this.readerURL);
          }
        }
      }
      else
      {
        gBrowser.loadURI(this.readerURL);
      }
    }
    else
    {
      gBrowser.mTabContainer.selectedIndex = openedGR.grTab;
      gBrowser.loadURI(this.readerURL);
    }
    var minCheck = 1;
    var configuredCheck = GRPrefs.checkfreq();
    var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
    if(GRPrefs.timeoutid)
    {
      clearTimeout(GRPrefs.timeoutid);
    }
    GRPrefs.timeoutid = setTimeout(GoogleIt, freq*1000*60);

  },
  /**
   * checks for opened GR window and blank pages
   * @return {Object}
   */
  getOpenedGR: function()
  {
    var brl = gBrowser.browsers.length, i = 0;
    var outObj = {grTab: false, blankPage: false};
    var r = new RegExp('^'+this.readerURL);
    for( ; i < brl; i++)
    {
      if(r.test(gBrowser.getBrowserAtIndex(i).currentURI.spec))
      {
        outObj.grTab = i;
        return outObj;
      }
      else if(gBrowser.getBrowserAtIndex(i).currentURI.spec == 'about:blank' && outObj.blankPage === false)
      {
        outObj.blankPage = i;
      }
    }
    return outObj;
  },
  /**
   * set the icon to off status
   */
  switchOffIcon: function()
  {
    setReaderStatus('off');
    updateIcon();
  },
  /**
   * set the icon to on status
   */
  switchOnIcon: function()
  {
    setReaderStatus('on');
    updateIcon();
  },
  /**
   * set the icon to error status
   */
  switchErrorIcon: function()
  {
    setReaderStatus('error');
    updateIcon();
  },
  /**
   * set the icon to load status
   */
  switchLoadIcon: function()
  {
    setReaderStatus('load');
    updateIcon();
  }
};
/**
 *
 */
var openReaderNotify =
{
  /**
   *
   * @param {Object} subject
   * @param {Object} topic
   * @param {Object} data
   */
  observe: function(subject, topic, data)
  {
    if(topic == 'alertclickcallback')
    {
      GRCheck.openReader();
    }
  }
};
/**
 * change the reader tooltiptext
 * @param {Object} txt
 */
var setReaderTooltip = function(t)
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements())
  {
    win = enumerator.getNext();
    var statusBar = win.document.getElementById('GRW-statusbar');
    if(typeof statusBar == 'undefined')
    {
      Log.log('GRW-statusbar object not found');
    }
    switch(t)
    {
      case 'error':
        statusBar.tooltip = 'GRW-statusbar-tooltip-error';
        break;
      case 'nonew':
      default :
        statusBar.tooltip = 'GRW-statusbar-tooltip-nonew';
        break;
      case 'new':
        statusBar.tooltip = 'GRW-statusbar-tooltip-new';
        break;
      case 'hide':
        statusBar.tooltip = '';
        break;
      case 'loginerror':
        statusBar.tooltip = 'GRW-statusbar-tooltip-loginerror';
        break;
    }
  }
};
/**
 * change the statusbar elem status
 * @param {Object} status
 */
var setReaderStatus = function(status)
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win, stImage;
  while(enumerator.hasMoreElements())
  {
    win = enumerator.getNext();
    win.document.getElementById('GRW-statusbar').status = status;
    stImage = win.document.getElementById('GRW-statusbar-image');
    switch(status)
    {
      case 'on':
        stImage.src = 'chrome://grwatcher/content/images/googlereader.png';
        break;

      case 'off':
      default:
        stImage.src = 'chrome://grwatcher/content/images/googlereader_grey.png';
        break;

      case 'error':
        stImage.src = 'chrome://grwatcher/content/images/googlereader_red.png';
        break;

      case 'load':
        stImage.src = 'chrome://grwatcher/content/images/loader.gif';
        break;
    }

  }

};
/**
 * returns the status value of the statusbar elem
 * @return {String}
 */
var getReaderStatus = function(win)
{
  return document.getElementById('GRW-statusbar').status;
};
/**
 * change the statusbar icon
 * @return {String}
 */
var updateIcon = function()
{
  /*
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    var stImage = win.document.getElementById('GRW-statusbar-image');
    if(typeof stImage == 'undefined') { return false; }
    var status = getReaderStatus(win);
    switch(status)
    {
      case 'on':
        stImage.src = 'chrome://grwatcher/content/images/googlereader.png';
        break;

      case 'off':
      default:
        stImage.src = 'chrome://grwatcher/content/images/googlereader_grey.png';
        break;

      case 'error':
        stImage.src = 'chrome://grwatcher/content/images/googlereader_red.png';
        break;

      case 'load':
        stImage.src = 'chrome://grwatcher/content/images/loader.gif';
        break;
    }
  }
  */
  return status;
};
/**
 * show the counter text
 * @param {Number} val
 */
var showCounter = function(val)
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements())
  {
    win = enumerator.getNext();

    var label = win.document.getElementById('GRW-statusbar-label');
    label.value = val;
    label.style.width = '';
    label.style.margin = '';
    label.crop = '';
    label.collapsed = false;
  }
  if(GRPrefs.showNotification && val != 0)
  {
    var GRW_bundle = document.getElementById('grwatcher-bundles');
    showNotification(false, GRW_bundle.getFormattedString('notifierMSG', [val]));
    GRPrefs.showNotification = false;
  }
};
/**
 * hide the counter text
 */
var hideCounter = function()
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements())
  {
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
 * request for unreaded feeds
 */
var getReadCounter = function()
{
  // GRCheck.switchLoadIcon();

  onunreadCountAjax = new Ajax(
  {
    url:'https://www.google.com/reader/api/0/unread-count?all=true&output=json',
    successHandler: function()
    {
      getReadFeedsCounter(this.req);
    }
  });
};
/**
 *
 */
var getFeedList = function()
{
  // GRCheck.switchLoadIcon();
  var getFeedListAjax = new Ajax(
  {
    url:'https://www.google.com/reader/api/0/subscription/list?output=json',
    successHandler: function()
    {
      onFeedListLoad(this.req);
    }
  });
};
/**
 *
 * @param {Object} prReq Counter reqest object
 */
var getReadFeedsCounter = function(prReq)
{
  // GRCheck.switchLoadIcon();

  getReadFeedsCounterAjax = new Ajax(
  {
    url:'https://www.google.com/reader/api/0/subscription/list?output=json',
    successHandler: function()
    {
      var r = onFeedsCounterLoad(this.req, onunreadCountAjax.req);
      var unr = r.counter;
      GRPrefs.currentNum = unr;
      if(unr === false)
      {
        setReaderTooltip('error');
        GRCheck.switchErrorIcon();
        Log.log('unr = false');
        hideCounter();
      }
      else if(unr > 0)
      {
        setReaderTooltip('new');
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var enumerator = wm.getEnumerator('navigator:browser'), win;
        while(enumerator.hasMoreElements()) {
          win = enumerator.getNext();
          win.genStatusGrid(r.feeds);
        }
        GRCheck.switchOnIcon();
        showCounter(unr);
      }
      else
      {
        setReaderTooltip('nonew');
        GRCheck.switchOffIcon();
        if(GRPrefs.showzerocounter() === false)
        {
          hideCounter();
        }
        else
        {
          showCounter(unr);
        }
        GRPrefs.showNotification = true;
      }
    }
  });
};
/**
 * count the unreaded feeeds
 * @param {Number,Boolean} r
 */
var countUnread = function(r)
{
  try
  {
    var data = eval('('+r.responseText+')');
  }
  catch (e)
  {
    return false;
  }
  var unrcount = 0;
  if(data) {
    var uc = data.unreadcounts;
    for(var i =0 ; i<  uc.length; i++) {
      for(var j = 0; j < FeedlistIds.length; j++)
      {
        if(FeedlistIds[j] == uc[i].id)
        {
          unrcount += uc[i].count;
        }
      }
    }
  }
  return unrcount;
};
/**
 * @param {Object} req ajax response object
 * @return {Array}
 */
var onFeedListLoad = function(r)
{
  try
  {
    var data = eval('('+r.responseText+')').subscriptions;
  }
  catch(e)
  {
    return false;
  }
  var ids = Array();
  for(var i = 0; i < data.length; i++)
  {
    ids.push(data[i].id);
  }
  FeedlistIds = ids;
  getReadCounter();
  return ids;
};
/**
 *
 * @param {Object} r
 * @return {Object}
 */
var feedsCounter = function(r)
{
  try
  {
    data = eval('('+r.responseText+')');
    data = data.subscriptions;
  }
  catch (e)
  {
    return false;
  }
  var datai, i, datal = data.length, out = Array();
  for(i = 0; i < datal; i++)
  {
    datai = data[i];
    out.push({title: datai.title, id: datai.id});
  }
  return out;
};
/**
 *
 * @param {Object} req FeedsCounter request object
 * @param {Object} prReq Counter request object
 * @return {Object}
 */
var onFeedsCounterLoad = function(req, prReq)
{
  if(prReq != false)
  {
    try
    {
      var prc = eval('('+prReq.responseText+')');
      prc = prc.unreadcounts;
    }
    catch (e)
    {
      var prc = false;
    }
  }
  else
  {
    var prc = false;
  }
  var feeds = Array();
  var unr = feedsCounter(req);
  for(var i = 0; i < unr.length; i++)
  {
    for(var j = 0; j < prc.length; j++)
    {
      if(unr[i].id == prc[j].id && prc[j].count > 0)
      {
        feeds.push({Title: unr[i].title, Id: unr[i].id, Count: prc[j].count})
      }
    }
  }
  // filter the feeds, which aren't in the feedlist
  var outFeeds = Array(), rex;
  var counter = 0;
  for(var i = 0; i < feeds.length; i++)
  {
    for(var j = 0; j < FeedlistIds.length; j++)
    {
      rex = new RegExp('^'+FeedlistIds[j]);
      if(FeedlistIds[j] == feeds[i].Id)
      {
        counter += feeds[i].Count;
        outFeeds.push(feeds[i]);
      }
    }
  }
  return {counter: counter, feeds: outFeeds};
};
/**
 * shows the notification window
 * @param {Object} label
 * @param {Object} value
 */
var showNotification = function(label, value)
{
  if(GRPrefs.shownotificationwindow() === false)
  {
    return false;
  }
  if(!label)
  {
    label = 'Google Reader Watcher';
  }
  if(!value)
  {
    value = 'Google Reader Watcher Notification';
  }
  var image = "chrome://grwatcher/skin/grwatcher.png";
  try
  {
    /**
     * Notifier for Windows
     */
    var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
    alertsService.showAlertNotification(image , label, value, true, "", openReaderNotify);
  }
  catch(e)
  {
    try
    {
      /**
      * Notifier for Linux
      */
      var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
        .getService(Components.interfaces.nsIWindowWatcher)
        .openWindow(null, "chrome://global/content/alerts/alert.xul", "_blank", "chrome,titlebar=no,popup=yes", null);
        alertWin.arguments = [image, label, value, true, "", 0, openReaderNotify];
        alertWin.setTimeout(function(){alertWin.close()},10000);
    }
    catch(e)
    {}
  }
};
/**
 * generate the grid for the tooltip
 * @param {Array} feeds
 */
var genStatusGrid = function(feeds)
{
  var tt = document.getElementById('GRW-statusbar-tooltip-new');
  GRPrefs.feeds = feeds;
  if(tt.firstChild)
  {
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
    function(o)
    {
      /**
       * create cells
       */
      rowc = row.cloneNode(true);
      labelc1 = label.cloneNode(true);
      labelc2 = label.cloneNode(true);
      if(o.Title.length > titlelength)
      {
        o.Title = o.Title.slice(0, titlelength-3)+'...'
      }
      // set up the counter position
      if(GRPrefs.tooltipcounterpos() == 'left')
      {
        labelc1.value = o.Count;
        labelc2.value = o.Title;
        labelc1.className = 'counterCol';
      }
      else
      {
        labelc1.value = o.Title;
        labelc2.value = o.Count;
        labelc2.className = 'counterCol';
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
};
/**
 * opens preferences window
 * @param {Object} event
 */
var openPrefs = function(event)
{
  window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
};
/**
 * get chrome preferences
 */
var GRPrefs =
{
  timeoutid: -1,
  showNotification: true,
  currentNum: null,
  feeds: null,
  checkfreq: function() {
    return prefManager.getIntPref('extensions.grwatcher.checkfreq');
  },
  openinnewtab: function() {
    return prefManager.getBoolPref('extensions.grwatcher.openinnewtab');
  },
  resetcounter: function()
  {
    return prefManager.getBoolPref('extensions.grwatcher.resetcounter');
  },
  tooltipcounterpos: function()
  {
    return prefManager.getCharPref('extensions.grwatcher.tooltipcounterpos');
  },
  tooltiptitlelength: function()
  {
    return prefManager.getIntPref('extensions.grwatcher.tooltiptitlelength');
  },
  email: function()
  {
    return prefManager.getCharPref('extensions.grwatcher.email');
  },
  rememberLogin: function()
  {
    return prefManager.getBoolPref('extensions.grwatcher.rememberLogin');
  },
  leftClickOpen: function()
  {
    return prefManager.getIntPref('extensions.grwatcher.leftclickopen');
  },
  activateOpenedTab: function()
  {
    return prefManager.getBoolPref('extensions.grwatcher.activateopenedtab');
  },
  shownotificationwindow: function()
  {
    return prefManager.getBoolPref('extensions.grwatcher.shownotificationwindow');
  },
  showzerocounter: function()
  {
    return prefManager.getBoolPref('extensions.grwatcher.showzerocounter');
  }
};
/**
 * do the request and process the received data
 * @return {Number}
 */
var GoogleIt = function()
{
  var activeWin = getActiveGRW();
  if(activeWin !== window)
  {
    activeWin.GoogleIt();
    return;
  }
  if(!accountManager.getCurrentSID())
  {
    var login = accountManager.logIn();
  }
  else
  {
    prefManager.setCharPref('extensions.grwatcher.sid', accountManager.getCurrentSID());
    getFeedList();
  }
  if(login === -1)
  {
    GRCheck.switchErrorIcon();
    Log.log('Login failed');
  }
  var minCheck = 1;
  var configuredCheck = GRPrefs.checkfreq();
  var freq = (configuredCheck >= minCheck) ? configuredCheck : minCheck;
  if(GRPrefs.timeoutid)
  {
    clearTimeout(GRPrefs.timeoutid);
  }
  GRPrefs.timeoutid = setTimeout(GoogleIt, freq*1000*60);
  return GRPrefs.timeoutid;
};
/**
 * @var {Object} event
 */
var statusClickHandling =
{
  status: null,
  statusBar: null,
  /**
   * add the event handler to the statusbar icon
   */
  observe: function()
  {
    this.status = GRPrefs.leftClickOpen();
    this.statusBar.addEventListener('click', statusClickHandling.click, false);
    if(this.status == 2)
    {
      this.statusBar.addEventListener('dblclick', statusClickHandling.click, false);
    }
  },
  /**
   * event handler runs when user click on the statusbar icon
   * event.button:
   * 0 = left click
   * 1 = middle click
   * 2 = right click
   * @param {Object} event
   */
  click: function(event)
  {
    switch(event.button)
    {
      case 0:
        if((statusClickHandling.status == 2 && event.type == 'dblclick') || (statusClickHandling.status == 1 && event.type == 'click'))
        {
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
 * @return {Boolean}
 */
var isActiveGRW = function()
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(win.GRW === true)
    {
      return true;
    }
    // |win| is [Object ChromeWindow] (just like |window|), do something with it
  }
  return false;
}
var getActiveGRW = function()
{
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
  while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    if(win.GRW === true)
    {
      return win;
    }
    // |win| is [Object ChromeWindow] (just like |window|), do something with it
  }
  return window;
};
windowCloseCheck = {
  observe: function()
  {
    var grw = false;
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
      win = enumerator.getNext();
      if(win.GRW === true)
      {
        grw = true;
      }
      // |win| is [Object ChromeWindow] (just like |window|), do something with it
    }
    if(grw === false)
    {
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
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Function} fun
 */
/*
var mapWindows = function(fun)
{
  var args = arguments;
  a = Array();
  for(var i = 1; i < args.length; i++)
  {
    a.push(args[i]);
  }
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator('navigator:browser'), win;
    while(enumerator.hasMoreElements()) {
    win = enumerator.getNext();
    eval('win.'+fun.apply(eval('win.'+fun), a));
  }
}
*/
/**
 * Initialiization function
 */
var GRWinit = function()
{
  if(isActiveGRW() === false)
  {
    window.GRW = true;
    var g = GoogleIt();
  }
  else
  {
    var activeWin = getActiveGRW();
    var unr = activeWin.GRPrefs.currentNum;
    GRPrefs.showNotification = false;
    if(unr === false)
    {
      setReaderTooltip('error');
      GRCheck.switchErrorIcon();
      hideCounter();
    }
    else if(unr > 0)
    {
      setReaderTooltip('new');
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      var enumerator = wm.getEnumerator('navigator:browser'), win;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        win.genStatusGrid(activeWin.GRPrefs.feeds);
      }
      // mapWindows(genStatusGrid, activeWin.GRPrefs.feeds);
      GRCheck.switchOnIcon();
      showCounter(unr);
    }
    else
    {
      setReaderTooltip('nonew');
      GRCheck.switchOffIcon();
      if(GRPrefs.showzerocounter() === false)
      {
        hideCounter();
      }
      else
      {
        showCounter(unr);
      }
    }
  }
  statusClickHandling.statusBar = document.getElementById('GRW-statusbar');
  statusClickHandling.observe();
  // Log.log('Google Reader Watcher Initialized');
  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(windowCloseCheck, "domwindowclosed", false);
};
