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
var GRWUserAgent = 'Google Reader Watcher 0.0.8';
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
      this.passwordManager.removeUser( url, username );
    }
    catch(error){}
    try
    {
      this.passwordManagerInternal.addUserFull( url, username, password, "", "" );
    }
    catch(error){}
  },

  getPassword: function()
  {
    var url = this.url;
    var host = {value:""};
    var user =  {value:""};
    var password = {value:""};
    try
    {
      this.passwordManagerInternal.findPasswordEntry( url, "", "", host, user, password );
    }
    catch(error){}
    return password.value;
  },

  getUserName: function()
  {
    var url = this.url;
    var host = {value:""};
    var user =  {value:""};
    var password = {value:""};
    try
    {
      this.passwordManagerInternal.findPasswordEntry( url, "", "", host, user, password );
    }
    catch(error){}
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
  accountExists: function()
  {
    if(passManager.getUserName() && passManager.getPassword())
    {
      return true;
    }
    return false;
  },
  /**
   * @return {String,false} returns the value of the cookie named `SID`
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
      GRCheck.switchLoadIcon();
      var req = new XMLHttpRequest();
      req.open('post', url, true);
      req.setRequestHeader('User-Agent', GRWUserAgent);
      req.setRequestHeader('Accept-Charset','utf-8');
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
      req.onreadystatechange = function(aEvt)
      {
        try
        {
          if(req.readyState == 4)
          {
            if(req.status == 200)
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
            else
            {
              GRCheck.switchErrorIcon();
              return false;
            }
          }
        }
        catch(e)
        {
          GRCheck.switchErrorIcon();
          return false;
        }
      }
      req.send(param);
    }
    else
    {
      this.loginFailed();
      return -1;
    }
  },

  loginFailed: function()
  {
    GRCheck.switchErrorIcon();
    return false;
  }
};
/**
 *
 */
var GRCheck =
{
  /**
   * open the readader window
   */
  readerURL: 'https://www.google.com/reader/view/',
  openReader: function()
  {
    if(GRPrefs.resetcounter())
    {
      hideCounter();
      setReaderTooltip('hide');
      GRPrefs.showNotification = true;
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
   */
  getOpenedGR: function()
  {
    var brl = gBrowser.browsers.length, i = 0;
    var outObj = {grTab: false, blankPage: false};
    for( ; i < brl; i++)
    {
      if(gBrowser.getBrowserAtIndex(i).currentURI.spec == this.readerURL)
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
  var statusBar = document.getElementById('GRW-statusbar');
  switch(t)
  {
    case 'error' :
      statusBar.tooltip = 'GRW-statusbar-tooltip-error';
      break;
    case 'nonew' :
    default :
      statusBar.tooltip = 'GRW-statusbar-tooltip-nonew';
      break;
    case 'new' :
      statusBar.tooltip = 'GRW-statusbar-tooltip-new';
      break;
    case 'hide':
      statusBar.tooltip = '';
      break;
    case 'loginerror' :
      statusBar.tooltip = 'GRW-statusbar-tooltip-loginerror';
      break;
  }
};
/**
 *
 * @param {Object} status
 */
var setReaderStatus = function(status)
{
  document.getElementById('GRW-statusbar').status = status;
};
/**
 *
 */
var getReaderStatus = function()
{
  return document.getElementById('GRW-statusbar').status;
};
/**
 * change the statusbar icon
 */
var updateIcon = function()
{
  switch(document.getElementById('GRW-statusbar').status)
  {
    case 'on':
      document.getElementById('GRW-statusbar-image').src = 'chrome://grwatcher/content/images/googlereader.png';
      break;

    case 'off':
    default:
      document.getElementById('GRW-statusbar-image').src = 'chrome://grwatcher/content/images/googlereader_grey.png';
      break;

    case 'error':
      document.getElementById('GRW-statusbar-image').src = 'chrome://grwatcher/content/images/googlereader_red.png';
      break;

    case 'load':
      document.getElementById('GRW-statusbar-image').src = 'chrome://grwatcher/content/images/loader.gif';
      break;
  }
};
/**
 * show the counter text
 * @param {Number} val
 */
var showCounter = function(val)
{
  var label = document.getElementById('GRW-statusbar-label');
  label.value = val;
  label.style.width = '';
  label.style.margin = '';
  label.crop = '';
  label.collapsed = false;
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
  var label = document.getElementById('GRW-statusbar-label');
  label.value = '';
  label.crop = 'end';
  label.style.margin = '0'
  label.style.width = '0';
  label.collapsed = true;
};
/**
 * request for unreaded feeds
 */
var getReadCounter = function()
{
  GRCheck.switchLoadIcon();
  var req = new XMLHttpRequest();
  req.open('get', 'https://www.google.com/reader/api/0/unread-count?all=true&output=json', true);
  req.setRequestHeader('User-Agent', GRWUserAgent);
  req.setRequestHeader('Accept-Charset','utf-8');
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.onreadystatechange = function(aEvt)
  {
    try
    {
      if(req.readyState == 4)
      {
        if(typeof req.status != 'undefined')
        {

          if(req.status == 200)
          {
            onCounterLoad(req);
          }
          else
          {
            GRCheck.switchErrorIcon();
            return false;
          }
        }
        else
        {
          GRCheck.switchErrorIcon();
          return false;
        }
      }
    }
    catch(e)
    {
      GRCheck.switchErrorIcon();
      return false;
    }
  }
  req.send(null);
};
var getFeedList = function()
{
  GRCheck.switchLoadIcon();
  var req = new XMLHttpRequest();

  req.open('get', 'https://www.google.com/reader/api/0/subscription/list?output=json', true);
  req.setRequestHeader('User-Agent', GRWUserAgent);
  req.setRequestHeader('Accept-Charset','utf-8');
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.onreadystatechange = function(aEvt)
  {
    try
    {
      if(req.readyState == 4)
      {
        if(typeof req.status != 'undefined')
        {

          if(req.status == 200)
          {
            onFeedListLoad(req);
          }
          else
          {
            GRCheck.switchErrorIcon();
            return false;
          }
        }
        else
        {
          GRCheck.switchErrorIcon();
          return false;
        }
      }
    }
    catch(e)
    {
      GRCheck.switchErrorIcon();
      return false;
    }
  }
  req.send(null);
};
/**
 *
 * @param {Object} prReq Counter reqest object
 */
var getReadFeedsCounter = function(prReq)
{
  GRCheck.switchLoadIcon();
  var req = new XMLHttpRequest();
  req.open('get', 'https://www.google.com/reader/api/0/subscription/list?output=json', true);
  req.setRequestHeader('User-Agent', GRWUserAgent);
  req.setRequestHeader('Accept-Charset','utf-8');
  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  req.onreadystatechange = function(aEvt)
  {
    try
    {
      if(req.readyState == 4)
      {
        if(typeof req.status != 'undefined')
        {
          if(req.status == 200)
          {
            var r = onFeedsCounterLoad(req, prReq);
            var unr = r.counter;
            if(unr === false)
            {
              setReaderTooltip('error');
              GRCheck.switchErrorIcon();
              hideCounter();
            }
            else if(unr > 0)
            {
              setReaderTooltip('new');
              genStatusGrid(r.feeds);
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
          else
          {
            GRCheck.switchErrorIcon();
            return false;
          }
        }
        else
        {
          GRCheck.switchErrorIcon();
          return false;
        }
      }
    }
    catch(e)
    {
      GRCheck.switchErrorIcon();
      return false;
    }
  }
  req.send(null);
};
/**
 * count the unreaded feeeds
 * @param {Object} r
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
        /*
        rex = new RegExp('^'+FeedlistIds[j]);
        if(rex.test(uc[i].id))
        {
          unrcount += uc[i].count;
        }
        */
        if(FeedlistIds[j] == uc[i].id)
        {
          unrcount += uc[i].count;
        }
      }
      /*
      if(uc[i].id.match('^feed')) {
        unrcount += uc[i].count;
      }
      */
    }
  }
  return unrcount;
};
/**
 * @param {Object} req ajax response object
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
 * @param {Object} req ajax response object
 */
var onCounterLoad = function(req)
{
  // var unr = countUnread(req);
   getReadFeedsCounter(req);
  
};
/**
 *
 * @param {Object} r
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
      /*
      if(rex.test(feeds[i].Id))
      {
        counter += feeds[i].Count;
        outFeeds.push(feeds[i]);
      }
      */
      if(FeedlistIds[j] == feeds[i].Id)
      {
        counter += feeds[i].Count;
        outFeeds.push(feeds[i]);
      }
    }
  }
  // genStatusGrid(feeds);
  // genStatusGrid(outFeeds);
  
  return {counter: counter, feeds: outFeeds};
};
/**
 * shows the notification window
 *
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
  if(tt.firstChild)
  {
    tt.removeChild(tt.firstChild)
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
  /*
  if(titlelength == 0)
  {
    titlelength = false;
  }
  */
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
 */
var GoogleIt = function()
{
  if(!accountManager.getCurrentSID())
  {
    var login = accountManager.logIn();
  }
  else
  {
    prefManager.setCharPref('extensions.grwatcher.sid', accountManager.getCurrentSID());
    // getReadCounter();
    getFeedList();
  }
  if(login === -1)
  {
    GRCheck.switchErrorIcon();
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
   * event.button: 0 = left click, 1 = middle click, 2 = right click
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
    Log.log('status: '+statusClickHandling.status+', type: '+event.type);
  }
};
/**
 * Initialiization function
 */
var GRWinit = function()
{
  var g = GoogleIt();
  statusClickHandling.statusBar = document.getElementById('GRW-statusbar');
  statusClickHandling.observe();
  Log.log('Google Reader Watcher Initialized');
};