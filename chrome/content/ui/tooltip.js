(function() {
  var tooltip = function(action, feeds, getlist) {
    var activeGRW = GRW.getActiveGRW().GRW;
    var cache = {
      activeGRW: activeGRW,
      getlist: activeGRW.GetList,
      feeds: activeGRW.feeds,
      labels: getlist.getLabels(),
    };
    if(GRW.UI.StatusbarTooltip) {
      GRW.UI.StatusbarTooltip(action, feeds, getlist, cache);
    }
    GRW.log('TOOLBARTOOLTIP:' + typeof GRW.UI.ToolbarTooltip);
    if(GRW.UI.ToolbarTooltip) {
      GRW.UI.ToolbarTooltip(action, feeds, getlist, cache);
    }
  };
  GRW.UI.Tooltip = tooltip;
})();
