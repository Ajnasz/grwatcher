(function() {
  if(GRW.UI.ToolbarIcon) {
    return;
  }
  var toolbaricon = {
    /**
     * change the toolbar elem status
     * @param {Object} status
     */
    setReaderStatus: function(status) {
      GRW.UI.MapWindows(function(win) {

        var statusImage = win.document.getElementById('GRW-toolbar-button');
        if(!statusImage) {return;}
        var classes = statusImage.getAttribute('class');
        classes = classes.replace(/ on| off| error| load/g, '');
        switch(status) {
          case 'on':
            classes += ' on';
            break;

          case 'off':
          default:
            classes += ' off';
            break;

          case 'error':
          case 'cookieerror':
            classes += ' error';
            break;

          case 'load':
            classes += ' load';
            break;
        }

        statusImage.setAttribute('class', classes);
      });
    },
  };
  GRW.UI.ToolbarIcon = toolbaricon;
})();
