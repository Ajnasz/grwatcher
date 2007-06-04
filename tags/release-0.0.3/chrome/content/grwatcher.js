var prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

Log = {
  serv: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
  log: function(message){
    this.serv.logStringMessage('GRW: '+message);
  }
}

passManager = {
  passwordManagerInternal: Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManagerInternal),
  passwordManager:         Components.classes["@mozilla.org/passwordmanager;1"].createInstance(Components.interfaces.nsIPasswordManager),
  url: "chrome://grwatcher/",

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
}

accountManager = {

  CookieManager: Components.classes["@mozilla.org/cookiemanager;1"].getService(Components.interfaces.nsICookieManager),
  accountExists: function()
  {
    if(passManager.getUserName() && passManager.getPassword())
    {
      return true;
    }
    return false;
  },
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

  logIn: function()
  {
    if(this.accountExists())
    {
      Log.log(passManager.getUserName()+' '+passManager.getPassword())
      var url = 'https://www.google.com/accounts/ServiceLoginAuth';
      var param = 'Email='+encodeURIComponent(passManager.getUserName())+'&Passwd='+encodeURIComponent(passManager.getPassword())+'&service=reader&continue=http://www.google.com';
      return Ajax.Request(url, param, 'post');
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
var GRCheck = {
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
    }
    this.switchOffIcon();
    if(GRPrefs.openinnewtab())
    {
      getBrowser().addTab('http://reader.google.com');
    }
    else
    {
      getBrowser().loadURI('http://reader.google.com');
    }
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
var openReaderNotify = {
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
var getReaderStatus = function()
{
  return document.getElementById('GRW-statusbar').status;
}
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


Ajax = {
  response: null,
  error: false,
  initialize: function(){},
  handler: function() {
    if(this.error === false)
    {
      if(this.response !== null && this.response.indexOf('Redirecting', 0) != -1)
      {
        prefManager.setCharPref('extensions.grwatcher.sid', accountManager.getCurrentSID());
        getReadCounter();
      }
    }
    else
    {
      Log.log('error: '+this.error.code+' '+this.error.text);
      return false;
    }
  },

  Request: function(url, param, method)
  {
    // Log.log('send request: '+url+'?'+param);
    var req = new XMLHttpRequest();
    req.open(method, url, true);
    req.onreadystatechange = function(aEvt)
    {
      Ajax.handleResp(req)
    }
    req.setRequestHeader('User-Agent','Google Reader Watcher 0.0.3b1 - Firefox Extension');
    req.setRequestHeader('Accept-Charset','utf-8');
    if (method.toLowerCase() == 'post')
		{
			req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		}
    req.send(param);
  },

  handleResp: function(resp, callback)
  {
    if(resp.readyState == 4)
    {
      if(resp.status == 200)
      {
        this.response = resp.responseText;
      }
      else
      {
        this.error = {code: resp.status, text: resp.statusText}
        this.response = false;
      }
    }
    this.handler();
  }
};

/**
 * request for unreaded feeds
 */
var getReadCounter = function()
{
  GRCheck.switchLoadIcon();
  var req = new XMLHttpRequest();
  req.open('get', 'http://www.google.com/reader/api/0/unread-count?all=true&output=json', true);
  req.onreadystatechange = function(aEvt)
  {
    if(req.readyState == 4)
    {
      if(req.status == 200)
      {
        onCounterLoad(req);
      }
      else
      {
        GRCheck.switchErrorIcon();
      }
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
  req.onreadystatechange = function(aEvt)
  {
    if(req.readyState == 4)
    {
      if(req.status == 200)
      {
        onFeedsCounterLoad(req, prReq);
      }
      else
      {
        GRCheck.switchErrorIcon();
      }
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
    uc = data.unreadcounts;
    for(var i=0; i<uc.length; i++) {
      if(uc[i].id.match('^feed')) {
        unrcount += uc[i].count;
      }
    }
  }
  return unrcount;
};

/**
 *
 * @param {Object} req ajax response object
 */
var onCounterLoad = function(req)
{
  var unr = countUnread(req);
  if(unr === false)
  {
    setReaderTooltip('error');
    GRCheck.switchErrorIcon();
    hideCounter();
  }
  else if(unr > 0)
  {
    getReadFeedsCounter(req)
    setReaderTooltip('new');
    GRCheck.switchOnIcon();
    showCounter(unr);
  }
  else
  {
    setReaderTooltip('nonew');
    GRCheck.switchOffIcon();
    hideCounter();
    GRPrefs.showNotification = true;
  }
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
}
/**
 *
 * @param {Object} req FeedsCounter request object
 * @param {Object} prReq Counter request object
 */
var onFeedsCounterLoad = function(req, prReq)
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
  var unr = feedsCounter(req);
  var feeds = Array();
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
  genStatusGrid(feeds);
};
/**
 * shows the notification window
 *
 * @param {Object} label
 * @param {Object} value
 */
showNotification = function(label, value)
{
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
    var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
    alertsService.showAlertNotification(image , label, value,
                                    true, "", openReaderNotify);
  }
  catch(e)
  {
    var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
               .getService(Components.interfaces.nsIWindowWatcher)
               .openWindow(null, "chrome://global/content/alerts/alert.xul",
               "_blank", "chrome,titlebar=no,popup=yes", null);
    alertWin.arguments = [image, label, value, true, "", 0, openReaderNotify];
    alertWin.setTimeout(function(){alertWin.close()},10000);
  }
};

/**
 *
 * @param {Array} feeds
 */
var genStatusGrid = function(feeds)
{
  var tt = document.getElementById('GRW-statusbar-tooltip-new');
  if(tt.firstChild)
  {
    tt.removeChild(tt.firstChild)
  }
  var titlelength = GRPrefs.tooltiptitlelength();
  titlelength = (titlelength > 0) ? titlelength : false;
  var grid = document.createElement('grid'), columns = document.createElement('columns'), column = document.createElement('column'), rows = document.createElement('rows'), row = document.createElement('row'), label = document.createElement('label');
  var columnc1, columnc2, rowc, labelc1, labelc2;
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
      if(titlelength != false && o.Title.length > titlelength)
      {
        o.Title = o.Title.slice(0, titlelength-3)+'...'
      }

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
}
/**
 * check regulary for new feeds
 */
var startInterval = function()
{
  clearInterval(GRPrefs.intervalid);
  var freq = (GRPrefs.checkfreq() >= 1) ? GRPrefs.checkfreq() : 1;
  GRPrefs.intervalid = setInterval(GoogleIt, freq*1000*60);
};
/**
 * open preferences window
 * @param {Object} event
 */
var openPrefs = function(event)
{
 window.openDialog("chrome://grwatcher/content/grprefs.xul", 'GRWatcher', 'chrome,titlebar,toolbar,centerscreen,modal');
};

/**
 * get chrome preferences
 */
var GRPrefs = {
  intervalid: -1,
  showNotification: true,
  init: function()
  {
    document.getElementById('GRW-accountmanage-pass').value = passManager.getPassword();
    document.getElementById('GRW-accountmanage-email').value = passManager.getUserName();
  },
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
  }
};
/**
 *
 * @param {Object} value
 */
Array.prototype.inArray = function(value)
{
  var a = this, al = a.length, i = 0;
  for(i = 0; i < al; i++)
  {
    if(a[i] === value)
    {
      return true;
    }
  }
  return false;
};
/**
 *
 */
GoogleIt = function()
{
  if(!accountManager.getCurrentSID())
  {
    var login = accountManager.logIn();
  }
  else
  {
    prefManager.setCharPref('extensions.grwatcher.sid', accountManager.getCurrentSID());
    return getReadCounter();
  }
  if(login === -1)
  {
    GRCheck.switchErrorIcon();
    return false;
  }
  /*
  else
  {
    return getReadCounter();
  }
  */
}
/**
 * Initialiization function
 */
var GRWinit = function()
{
  GoogleIt();
  /**
   * There is a bug, when I absolutely logged out, the first check don't show the correct value
   */
  /*
  if(getReaderStatus() != 'on')
  {
    setTimeout(GoogleIt, 5000);
  }
  */
  startInterval();
}