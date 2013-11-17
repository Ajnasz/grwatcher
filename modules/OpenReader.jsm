/*jslint sloppy: true */
var scope = {};
Components.utils.import("resource://grwmodules/prefs.jsm", scope);
Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
Components.utils.import("resource://grwmodules/clientConfigs.jsm", scope);
/*global Components:true */
var clientConfig = scope.clientsConfig;
var getPref = scope.prefs.get;

var getOpenedGR = function (gBrowser) {
    Components.utils.import("resource://grwmodules/generateUri.jsm", scope);
    var outObj = {grTab: false, blankPage: false},
        r = new RegExp('^' + scope.generateUri(clientConfig.readerURL, false)),
        i = gBrowser.browsers.length - 1,
        curSpec;

    while (i >= 0) {
        curSpec = gBrowser.getBrowserAtIndex(i).currentURI.spec;
        if (r.test(curSpec)) {
            outObj.grTab = i;
            break;
        } else if ((curSpec === 'about:blank' || curSpec === 'about:newtab') &&
                   outObj.blankPage === false) {
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

    loadIntoNewWindow: function (url) {
        scope.grwlog('open window');
        var Cc = Components.classes;
        Cc["@mozilla.org/embedcomp/window-watcher;1"]
            .getService(Components.interfaces.nsIWindowWatcher)
            .openWindow(
                  // parent window
                Cc["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator)
                    .getMostRecentWindow("navigator:browser"),
                url,
                // window name
                null,
                // window params
                null,
                null
            );
    },

    loadIntoCurrentTab: function (url) {
        scope.grwlog('load into current tab');
        this.gBrowser().loadURI(url);
    },

    loadIntoNewForegroundTab: function (url) {
        var gBrowser = this.gBrowser(),
            openedGR = getOpenedGR(gBrowser),
            currentContent = gBrowser
                .getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow;
        /**
         * isn't there any blank page
         */
        if (openedGR.blankPage === false) {
            gBrowser.selectedTab = gBrowser.addTab(url);
            currentContent.focus();
        } else {
            /**
             * load the GR into the blank page
             */
            gBrowser.mTabContainer.selectedIndex = openedGR.blankPage;
            gBrowser.loadURI(url);
            currentContent.focus();
        }
    },

    loadIntoNewBackgroundTab: function (url) {
        var gBrowser = this.gBrowser(),
            openedGR = getOpenedGR(gBrowser);
        /**
        * isn't there any blank page
        */
        if (openedGR.blankPage === false) {
            gBrowser.addTab(url);
        } else {
            gBrowser.getBrowserAtIndex(openedGR.blankPage).loadURI(url);
        }
    },

    loadIntoNewTab: function (url) {
        var gBrowser = this.gBrowser(),
            openedGR = getOpenedGR(gBrowser),
            currentContent = gBrowser
                .getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindow;
        if (getPref.activateOpenedTab()) {
            this.loadIntoNewForegroundTab(url);
        } else {
            this.loadIntoNewBackgroundTab(url);
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

    getOpenerFunction: function (subUrl, how) {
        return function open() {
            var url;
            scope.grwlog('open grw', how, subUrl);
            try {
                this.fireEvent('beforeReaderOpened');
                url = subUrl ?
                        scope.generateUri(clientConfig.readerURL, false) +
                            clientConfig.subscriptionPrefix + '/' + encodeURIComponent(subUrl) :
                        scope.generateUri(clientConfig.readerURL, false);
                /**
                * google reader doesn't opened yet
                */
                if (this.hasOpenedGR()) {
                    scope.grwlog('has opened grw');
                    this.focusCurrentGR(url);
                } else {
                    scope.grwlog('open somehow: ', how);
                    switch (how) {
                    case 'newWindow':
                        this.loadIntoNewWindow(url);
                        break;
                    case 'newBackgroundTab':
                        this.loadIntoNewBackgroundTab(url);
                        break;
                    case 'newForegroundTab':
                        this.loadIntoNewForegroundTab(url);
                        break;
                    case 'currentTab':
                        scope.grwlog('load inooo current tab');
                        this.loadIntoCurrentTab(url);
                        break;
                    default:
                        scope.grwlog('mode not found: ', '++++' + how + '++++',
                                     typeof how, how.length);
                    }
                }
            } catch (e) {
                scope.grwlog('reader open', e);
                scope.grwlog('fileName', e.fileName);
                scope.grwlog('line', e.lineNumber);
            }
            this.fireEvent('readerOpened');
        }.bind(this);
    },

    open: function (subUrl, how) {
        Components.utils.import("resource://grwmodules/prefs.jsm", scope);
        Components.utils.import("resource://grwmodules/loginmanager.jsm", scope);
        Components.utils.import("resource://grwmodules/generateUri.jsm", scope);

        var open = this.getOpenerFunction(subUrl, how);

        how = how || 'currentTab';
        this.fireEvent('startOpen');

        open();
    }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
scope.augmentProto(OpenReader, scope.EventProvider);

var EXPORTED_SYMBOLS = ['OpenReader'];
// var openReader = new OpenReader();
