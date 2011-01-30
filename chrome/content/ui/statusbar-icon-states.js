(function() {
  var statusbaricon = {
    /**
     * change the statusbar elem status
     * @param {Object} status
     */
    setReaderStatus: function(status) {
      Components.utils.import("resource://grwmodules/mapwindows.jsm");
      mapwindows(function(win) {

        var statusImage = win.document.getElementById('GRW-statusbar');
        if(!statusImage) {return;}
        switch(status) {
          case 'on':
            statusImage.setAttribute('class', 'on');
            break;

          case 'error':
          case 'cookieerror':
            statusImage.setAttribute('class', 'error');
            break;

          case 'load':
            statusImage.setAttribute('class', 'load');
            break;

          case 'off':
          default:
            statusImage.setAttribute('class', 'off');
            break;
        }
      });
    },
  };
  GRW.UI.StatusbarIcon = statusbaricon;
})(GRW);
