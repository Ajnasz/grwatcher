/*jslint indent: 2*/
Components.utils.import("resource://grwmodules/Prefs.jsm");
/*global Prefs:true, gBrowser*/
var readerURL = 'www.google.com/reader/view',
    getPref = Prefs.get;

var getOpenedGR = function (gBrowser) {
  Components.utils.import("resource://grwmodules/GRWUri.jsm");
  var outObj = {grTab: false, blankPage: false},
      r = new RegExp('^'+GRWUri(readerURL, false)),
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
  _open: function (subUrl) {
    try {
      this.fireEvent('beforeReaderOpened');
      Components.utils.import("resource://grwmodules/GRWUri.jsm");
      /*global GRWUri: true*/
      var url = subUrl ? GRWUri(readerURL, false) + '/' + subUrl : GRWUri(readerURL, false),
          gBrowser = this.gBrowser(),
          openedGR = getOpenedGR(gBrowser),
          currentContent = gBrowser
            .getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow;
      /**
      * google reader doesn't opened yet
      */
      if (openedGR.grTab === false) {
        /**
        * open in new tab
        */
        if (getPref.openInNewTab()) {
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
        } else {
          gBrowser.loadURI(url);
        }
      } else {
        gBrowser.mTabContainer.selectedIndex = openedGR.grTab;
        gBrowser.loadURI(url);
      }
    } catch (e) {
      Components.utils.import("resource://grwmodules/GRWLog.jsm");
      /*global GRWLog: true*/
      GRWlog('reader open', e);
      GRWlog('fileName', e.fileName);
      GRWlog('line', e.lineNumber);
    }
    this.fireEvent('readerOpened');
  },
  open: function (subUrl) {
    Components.utils.import("resource://grwmodules/Prefs.jsm");
    /*global Prefs: true,GRW: true */
    if (Prefs.get.forceLogin()) {
      var _this = this;
      GRW.LoginManager.logIn(function () {
        _this._open(subUrl);
      });
    } else {
      this._open(subUrl);
    }
  }
};
Components.utils.import("resource://grwmodules/Augment.jsm");
Components.utils.import("resource://grwmodules/EventProvider.jsm");
/*global EventProvider: true, augmentProto: true*/
augmentProto(OpenReader, EventProvider);

let EXPORTED_SYMBOLS = ['OpenReader'];
// var openReader = new OpenReader();
