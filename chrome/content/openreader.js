(function() {
  var readerURL = GRW.States.conntype + '://www.google.com/reader/view',
      getPref = GRW.Prefs.get;

  var getOpenedGR = function() {
    var outObj = {grTab: false, blankPage: false},
        r = new RegExp('^'+readerURL),
        i = gBrowser.browsers.length - 1,
        getBrowserAtIndex = gBrowser.getBrowserAtIndex,
        curSpec;
    while(i >= 0) {
      curSpec = getBrowserAtIndex(i).currentURI.spec;
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

  var openReader = function(subUrl) {
    var url = subUrl ? readerURL + '/' + subUrl : readerURL;
        openedGR = getOpenedGR(),
        selectedIndex = gBrowser.mTabContainer.selectedIndex,
        currentContent = getBrowserAtIndex(selectedIndex).contentWindow,
        addTab = gBrowser.addTab;
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
            gBrowser.selectedTab = addTab(subUrl);
            currentContent.focus();
          } else {
            addTab(subUrl);
          }
        } else {
          /**
           * load the GR into the blank page
           */
          if(getPref.activateOpenedTab()) {
            selectedIndex = openedGR.blankPage;
            gBrowser.loadURI(url);
            currentContent.focus();
          } else {
            getBrowserAtIndex(openedGR.blankPage).loadURI(url);
          }
        }
      } else {
        gBrowser.loadURI(url);
      }
    } else {
      selectedIndex = openedGR.grTab;
      gBrowser.loadURI(url);
    }
    this.fireEvent('readerOpened');
  };
  GRW.augmentProto(openReader, GRW.EventProvider);
  GRW.module('OpenReader', openReader);
})();
