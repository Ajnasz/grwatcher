/*jslint indent: 2*/
var scope = {};
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
/*global Components:true */
var readerURL = 'www.google.com/reader/view',
    getPref = scope.prefs.get;

var getOpenedGR = function (gBrowser) {
  Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
  var outObj = {grTab: false, blankPage: false},
      r = new RegExp('^' + scope.generateUri(readerURL, false)),
      i = gBrowser.browsers.length - 1,
      curSpec;
  while (i >= 0) {
    curSpec = gBrowser.getBrowserAtIndex(i).currentURI.spec;
    if (r.test(curSpec)) {
      outObj.grTab = i;
      break;
    } else if (curSpec === 'about:blank' && outObj.blankPage === false) {
      outObj.blankPage = i;
    }
    i -= 1;
  }
  return outObj;
};

var OpenReader = function () {};
OpenReader.prototype = {
  gBrowser: function () {
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
      .getService(Components.interfaces.nsIWindowMediator);
    return wm.getMostRecentWindow("navigator:browser").gBrowser;
  },
  loadToCurrentTab: function (url) {
    this.gBrowser().loadURI(url);
  },
  loadIntoToNewTab: function (url) {
    var gBrowser = this.gBrowser(),
        openedGR = getOpenedGR(gBrowser),
        currentContent = gBrowser
          .getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow;
    /**
    * isn't there any blank page
    */
    if (openedGR.blankPage === false) {
      if (getPref.activateOpenedTab()) {
        gBrowser.selectedTab = gBrowser.addTab(url);
        currentContent.focus();
      } else {
        gBrowser.addTab(url);
      }
    } else {
      /**
      * load the GR into the blank page
      */
      if (getPref.activateOpenedTab()) {
        gBrowser.mTabContainer.selectedIndex = openedGR.blankPage;
        gBrowser.loadURI(url);
        currentContent.focus();
      } else {
        gBrowser.getBrowserAtIndex(openedGR.blankPage).loadURI(url);
      }
    }
  },
  focusCurrentGR: function (url) {
    var gBrowser = this.gBrowser(),
        openedGR = getOpenedGR(gBrowser);
    gBrowser.mTabContainer.selectedIndex = openedGR.grTab;
    gBrowser.loadURI(url);
  },
  getBlankPage: function () {
    return getOpenedGR(this.gBrowser()).blankPage;
  },
  hasOpenedGR: function () {
    return getOpenedGR(this.gBrowser()).grTab !== false;
  },
  _loginAndOpen: function (subUrl) {
    Components.utils.import("resource://grwmodules/siteLogin.jsm", scope);
    var me = this;
    scope.siteLogin(function () {
      me._open(subUrl);
    });
  },
  _open: function (subUrl) {
    try {
      this.fireEvent('beforeReaderOpened');
      Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
      var url = subUrl ?
        scope.generateUri(readerURL, false) + '/' + subUrl :
        scope.generateUri(readerURL, false);
      /**
      * google reader doesn't opened yet
      */
      if (!this.hasOpenedGR()) {
        /**
        * open in new tab
        */
        if (getPref.openInNewTab()) {
          this.loadIntoToNewTab(url);
        } else {
          this.loadToCurrentTab(url);
        }
      } else {
        this.focusCurrentGR(url);
      }
    } catch (e) {
      Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
      scope.grwlog('reader open', e);
      scope.grwlog('fileName', e.fileName);
      scope.grwlog('line', e.lineNumber);
    }
    this.fireEvent('readerOpened');
  },
  open: function (subUrl) {
    Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);
    this.fireEvent('startOpen');
    // Login before page open can not be forced if user logs in with oauth
    // since we don't have any username and/or password
    if (scope.prefs.get.haveMultipleAccounts() &&
        scope.loginManager.getAuthType() !== scope.LoginManager.authTypeOauth2) {
      this._loginAndOpen(subUrl);
    } else {
      this._open(subUrl);
    }
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(OpenReader, scope.EventProvider);

let EXPORTED_SYMBOLS = ['OpenReader'];
// var openReader = new OpenReader();
