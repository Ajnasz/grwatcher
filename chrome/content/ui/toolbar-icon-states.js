(function() {
  var toolbaricon = {
    /**
     * change the toolbar elem status
     * @param {Object} status
     */
    setReaderStatus: function(status) {
      GRW.log('setReaderStatus', status);
      GRW.UI.MapWindows(function(win) {

        var statusImage = win.document.getElementById('GRW-toolbar-button');
        if(!statusImage) {return;}
        GRW.log('statusimage', statusImage.src, status);
        switch(status) {
          case 'on':
            statusImage.setAttribute('class', 'on');
            break;

          case 'off':
          default:
            statusImage.setAttribute('class', 'off');
            break;

          case 'error':
          case 'cookieerror':
            statusImage.setAttribute('class', 'error');
            break;

          case 'load':
            statusImage.setAttribute('class', 'load');
            break;
        }
      });
    },
  };
  GRW.UI.ToolbarIcon = toolbaricon;
})();
