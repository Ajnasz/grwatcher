(function() {
  var maxTitlelenth = 5,
      titlelength   = GRW.Prefs.get.tooltipTitleLength();

  var Grid = function(doc, feeds, getlist) {
    this.document = doc;
    this.feeds = feeds;
    this.getlist = getlist;
    this.toLeft = GRW.Prefs.get.tooltipCounterPos() == 'left';
    this.orderByLabels = GRW.Prefs.get.sortByLabels();
    if(this.orderByLabels) {
      this.labels = getlist.getLabels();
    }
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
    genRow: function(item, isLabel) {
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
      GRW.log('islabel: ', isLabel ? 'true' : 'false');
      if(isLabel) {
        row.setAttribute('class', 'tag');
      }

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
          rows = this.document.createElement('rows');

      titlelength = (titlelength > maxTitlelenth) ? titlelength : maxTitlelenth;

      if(this.orderByLabels) {
        var labels = {},
            currentLabels = this.labels;
        feeds.forEach(function(item) {
          var itemId = item.id;
          if(!labels[currentLabels[itemId]]) {
            labels[currentLabels[itemId]] = {count: 0, rows: []};
          }
          labels[currentLabels[itemId]].rows.push(this.genRow(item));
          labels[currentLabels[itemId]].count += item.count;
        }, this);
        for(var label in labels) {
          rows.appendChild(this.genRow({data: {title: label == 'undefined' ? '-' : label}, count: labels[label].count}, true));
          labels[label].rows.forEach(function(row) {rows.appendChild(row)});
        }

      } else {
        feeds.forEach(function(item) {
          rows.appendChild(this.genRow(item));
        }, this);
      }
      return rows;
    },
    getGrid: function() {
      return this.grid;
    }
  };
  var statusbarTooltip = function(feeds, getlist) {
    GRW.UI.MapWindows(function(win) {
      var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');
      if(tooltipContainer) {
        win.document.getElementById('GRW-statusbar').tooltip = 'GRW-statusbar-tooltip-new';
        var grid = new Grid(win.document, feeds, getlist).getGrid();
        while(tooltipContainer.firstChild) {
          tooltipContainer.removeChild(tooltipContainer.firstChild);
        }
        tooltipContainer.appendChild(grid);
      }
    });
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
