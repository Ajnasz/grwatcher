(function() {
  var statusbaricon = {
    /**
     * change the statusbar elem status
     * @param {Object} status
     */
    setReaderStatus: function(status) {
      GRW.UI.MapWindows(function(win) {

        var statusImage = win.document.getElementById('GRW-statusbar-image');
        if(!statusImage) {return;}
        switch(status) {
          case 'on':
            statusImage.src = 'chrome://grwatcher/skin/feed-icon-statusbar.png';
            break;


          case 'error':
          case 'cookieerror':
            statusImage.src = 'chrome://grwatcher/skin/feed-icon-error-statusbar.png';
            break;

          case 'load':
            statusImage.src = 'chrome://grwatcher/skin/loading-small.gif';
            break;

          case 'off':
          default:
            statusImage.src = 'chrome://grwatcher/skin/feed-icon-inactive-statusbar.png';
            break;
        }
      });
    },
  };
  GRW.UI.StatusbarIcon = statusbaricon;
})();
