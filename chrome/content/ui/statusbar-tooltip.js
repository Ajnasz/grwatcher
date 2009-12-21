(function() {
  var maxTitlelenth = 5;
  var _genRows = function(doc, feeds) {
    var row = doc.createElement('row'),
        label = doc.createElement('label'),
        titlelength = GRW.Prefs.get.tooltipTitleLength(),
        maximizeCounter = GRW.Prefs.get.maximizeCounter(),
        _rows = doc.createElement('rows'),
        _title,
        _count,
        _rowc,
        _labelc1,
        _labelc2;

    titlelength = (titlelength > maxTitlelenth) ? titlelength : maxTitlelenth


    if(GRW.Prefs.get.tooltipCounterPos() == 'left') {
      feeds.forEach(function(item) {
        var itemTitle = item.data.title;
        _count = maximizeCounter;

        _labelc1 = label.cloneNode(true);
        _labelc1.value = item.count;
        _labelc1.setAttribute('class', 'counterCol');

        _labelc2 = label.cloneNode(true);
        _labelc2.value = itemTitle.length > titlelength
                          ? itemTitle.slice(0, titlelength-3)+'...'
                          : itemTitle;

        _rowc = row.cloneNode(true);
        _rowc.appendChild(_labelc1);
        _rowc.appendChild(_labelc2);

        _rows.appendChild(_rowc);
      });
    } else {
      feeds.forEach(function(item) {
        
        _count = maximizeCounter;

        _labelc1 = label.cloneNode(true);
        _labelc1.value = item.data.title;

        _labelc2 = label.cloneNode(true);
        _labelc2.value = item.count;
        _labelc2.setAttribute('class', 'counterCol');

        _rowc = row.cloneNode(true);
        _rowc.appendChild(_labelc1);
        _rowc.appendChild(_labelc2);

        _rows.appendChild(_rowc);
      });
    }
    return _rows;
  };
  var genGrid = function(doc, feeds) {
    var grid = doc.createElement('grid'),
        columns = doc.createElement('columns'),
        column = doc.createElement('column'),
        columnc1, columnc2, rowc, labelc1, labelc2,
        rows;


    grid.flex = 1;
    // grid.setAttribute('class', 'GRW-statusbar-tooltip-grid ' + this.class)
    grid.id = '';

    columnc1 = column.cloneNode(true);
    columnc1.flex = 1;
    columnc2 = column.cloneNode(true);

    rows = _genRows(doc, feeds);

    grid.appendChild(columnc1);
    grid.appendChild(columnc2);
    grid.appendChild(rows);
    return grid;
  };
  var statusbarTooltip = function(feeds) {
    GRW.UI.MapWindows(function(win) {
      var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');
      if(tooltipContainer) {
        win.document.getElementById('GRW-statusbar').tooltip = 'GRW-statusbar-tooltip-new';
        var grid = genGrid(win.document, feeds);
        while(tooltipContainer.firstChild) {
          tooltipContainer.removeChild(tooltipContainer.firstChild);
        }
        tooltipContainer.appendChild(grid);
      }
    });
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
