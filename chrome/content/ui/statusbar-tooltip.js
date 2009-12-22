(function() {
  var maxTitlelenth = 5,
      titlelength   = GRW.Prefs.get.tooltipTitleLength();

  var Grid = function(doc, feeds) {
    this.document = doc;
    this.feeds = feeds;
    this.toLeft = GRW.Prefs.get.tooltipCounterPos() == 'left';
    this.init();

  };
  Grid.prototype = {
    init: function() {
      var doc = this.document,
          grid = doc.createElement('grid'),
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

      rows = this.genRows();

      grid.appendChild(columnc1);
      grid.appendChild(columnc2);
      grid.appendChild(rows);
      this.grid = grid;
    },
    genRow: function(item) {
      var itemTitle  = item.data.title,
          itemCount  = item.count,
          doc        = this.document,
          label      = doc.createElement('label'),
          row        = doc.createElement('row'),
          countLabel = label.cloneNode(true),
          titleLabel = label.cloneNode(true);

      itemTitle = itemTitle.length > titlelength
                    ? itemTitle.slice(0, titlelength - 3) + '...'
                    : itemTitle;
          
      countLabel.value = itemCount;
      countLabel.setAttribute('class', 'counterCol');

      titleLabel.value = itemTitle;

      if(this.toLeft) {
        row.appendChild(countLabel);
        row.appendChild(titleLabel);
      } else {
        row.appendChild(titleLabel);
        row.appendChild(countLabel);
      }
      return row;
    },
    genRows: function() {
      var maximizeCounter = GRW.Prefs.get.maximizeCounter(),
          feeds = this.feeds,
          _rows = this.document.createElement('rows');

      titlelength = (titlelength > maxTitlelenth) ? titlelength : maxTitlelenth;


      feeds.forEach(function(item) {
        _rows.appendChild(this.genRow(item));
      }, this);
      return _rows;
    },
    getGrid: function() {
      return this.grid;
    }
  };
  var statusbarTooltip = function(feeds) {
    GRW.UI.MapWindows(function(win) {
      var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');
      if(tooltipContainer) {
        win.document.getElementById('GRW-statusbar').tooltip = 'GRW-statusbar-tooltip-new';
        var grid = new Grid(win.document, feeds).getGrid();
        while(tooltipContainer.firstChild) {
          tooltipContainer.removeChild(tooltipContainer.firstChild);
        }
        tooltipContainer.appendChild(grid);
      }
    });
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
