(function() {
  var conf = {
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
 
  };
  Components.utils.import("resource://grwmodules/tooltip.jsm");
  GRW.UI.StatusbarTooltip = Tooltip(conf,GRW);
}());
