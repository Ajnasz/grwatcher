(function() {
  var readerURL = GRW.States.conntype + '://www.google.com/reader/view',
      getPref = GRW.Prefs.get;

  var getOpenedGR = function() {
    var outObj = {grTab: false, blankPage: false},
        r = new RegExp('^'+readerURL),
        i = gBrowser.browsers.length - 1,
        curSpec;
    while(i >= 0) {
      curSpec = gBrowser.getBrowserAtIndex(i).currentURI.spec;
      if(r.test(curSpec)) {
        outObj.grTab = i;
        break;
      } else if(
          curSpec == 'about:blank'
          && outObj.blankPage === false
        ) {
            outObj.blankPage = i;
      }
      i--;
    }
    return outObj;
  };

  var openReader = function() {
  };
  openReader.prototype = {
    open: function(subUrl) {
      try {
        var url = subUrl ? readerURL + '/' + subUrl : readerURL;
            openedGR = getOpenedGR(),
            currentContent = gBrowser.getBrowserAtIndex(gBrowser.mTabContainer.selectedIndex).contentWindo;
        /**
        * google reader doesn't opened yet
        */
        if(openedGR.grTab === false) {
          /**
          * open in new tab
          */
          if(getPref.openInNewTab()) {
            /**
            * isn't there any blank page
            */
            if(openedGR.blankPage === false) {
              if(getPref.activateOpenedTab()) {
                gBrowser.selectedTab = gBrowser.addTab(url);
                currentContent.focus();
              } else {
                gBrowser.addTab(url);
              }
            } else {
              /**
              * load the GR into the blank page
              */
              if(getPref.activateOpenedTab()) {
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
      } catch(e) {
        GRW.log('reader open', e);
        GRW.log('fileName', e.fileName);
        GRW.log('line', e.lineNumber);
      }
      this.fireEvent('readerOpened');
    }
  };
  GRW.augmentProto(openReader, GRW.EventProvider);
  GRW.module('OpenReader', new openReader);
})();
