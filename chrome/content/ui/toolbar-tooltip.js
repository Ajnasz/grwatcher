(function() {
  var conf = {
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
  Components.utils.import("resource://grwmodules/tooltip.jsm");
  GRW.UI.ToolbarTooltip = Tooltip(conf,GRW);
}());
