(function() {
  const statusbarConf = {
    elementID: 'GRW-statusbar',
    tooltipNewElement: 'GRW-statusbar-tooltip-new',
    tooltipErrorElement: 'GRW-statusbar-tooltip-error',
    tooltipNoNewElement: 'GRW-statusbar-tooltip-nonew',
    tooltipCookieErrorElement: 'GRW-statusbar-tooltip-cookieerror',
    tooltipNetworkErrorElement: 'GRW-statusbar-tooltip-networkerror',
    tooltipLoginErrorElement: 'GRW-statusbar-tooltip-loginerror',
    tooltipTtbNetworkErrorElement: 'GRW-statusbar-tooltip-networkerror',
    menuItem: 'GRW-statusbar-menu',
    menuItemSeparator: 'GRW-menuseparator',
  },
  toolbarConf = {
    elementID: 'GRW-toolbar-button',
    tooltipNewElement: 'GRW-toolbar-tooltip-new',
    tooltipErrorElement: 'GRW-toolbar-tooltip-error',
    tooltipNoNewElement: 'GRW-toolbar-tooltip-nonew',
    tooltipCookieErrorElement: 'GRW-toolbar-tooltip-cookieerror',
    tooltipNetworkErrorElement: 'GRW-toolbar-tooltip-networkerror',
    tooltipLoginErrorElement: 'GRW-toolbar-tooltip-loginerror',
    tooltipTtbNetworkErrorElement: 'GRW-ttb-tooltip-networkerror',
    menuItem: 'GRW-toolbar-menu',
    menuItemSeparator: 'GRW-toolbar-menuseparator',
  };
  var tooltip = function(action, feeds, getlist) {
    Components.utils.import("resource://grwmodules/tooltip.jsm");
    Tooltip(statusbarConf, GRW)(action, feeds, getlist);
    Tooltip(toolbarConf, GRW)(action, feeds, getlist);
  };
  GRW.UI.Tooltip = tooltip;
})();
