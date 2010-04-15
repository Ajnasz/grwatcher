(function() {
  var tooltip = function(action, feeds, getlist) {
    var activeGRW = GRW.getActiveGRW().GRW;
    // var cache = {
    //   activeGRW: activeGRW,
    //   getlist: activeGRW.GetList,
    //   feeds: activeGRW.feeds,
    //   labels: getlist ? getlist.getLabels() : null,
    // };
    if(GRW.UI.StatusbarTooltip) {
      GRW.UI.StatusbarTooltip(action, feeds, getlist);
    }
    if(GRW.UI.ToolbarTooltip) {
      GRW.UI.ToolbarTooltip(action, feeds, getlist);
    }
  };
  GRW.UI.Tooltip = tooltip;
})();
