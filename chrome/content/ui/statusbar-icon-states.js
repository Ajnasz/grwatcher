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
            statusImage.src = 'chrome://grwatcher/content/images/googlereader.png';
            break;

          case 'off':
          default:
            statusImage.src = 'chrome://grwatcher/content/images/googlereader_grey.png';
            break;

          case 'error':
            statusImage.src = 'chrome://grwatcher/content/images/googlereader_red.png';
            break;

          case 'cookieerror':
            statusImage.src = 'chrome://grwatcher/content/images/googlereader_red.png';
            break;

          case 'load':
            statusImage.src = 'chrome://grwatcher/content/images/loader.gif';
            break;
        }
      });
    },
  };
  GRW.UI.StatusbarIcon = statusbaricon;
})();
