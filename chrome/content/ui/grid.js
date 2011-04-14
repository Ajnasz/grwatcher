(function () {
  Components.utils.import("resource://grwmodules/GridProvider.jsm");
  Components.utils.import("resource://grwmodules/Augment.jsm");

  var Grid = function(doc, feeds, labels) {
    this.document = doc;
    this.feeds = feeds || [];
    // this.getlist = getlist;
    Components.utils.import("resource://grwmodules/Prefs.jsm");
    this.toLeft = Prefs.get.tooltipCounterPos() == 'left';
    this.labels = labels;
    this.peopleYouFollow = GRW.strings.getString('peopleyoufollowtitle');
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
      grid.id = '';

      columnc1 = column.cloneNode(true);
      columnc1.flex = 1;
      columnc2 = column.cloneNode(true);

      rows = this.ggenRows();

      grid.appendChild(columnc1);
      grid.appendChild(columnc2);
      grid.appendChild(rows);
      this.grid = grid;
    },
    genRow: function(item, isLabel) {
      var itemTitle  = this.getTitle(item),
          itemCount  = item.count,
          doc        = this.document,
          label      = doc.createElement('label'),
          row        = doc.createElement('row'),
          countLabel = label.cloneNode(true),
          titleLabel = label.cloneNode(true);

      countLabel.value = itemCount;
      countLabel.setAttribute('class', 'counterCol');
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
    ggenRows: function() {
      var rows = this.document.createElement('rows');
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      var generatedRows = this.genRows(this.feeds, Prefs.get.sortByLabels(), this.peopleYouFollow);
      generatedRows.forEach(function(item) {
        if (item.rows) {
          item.rows.forEach(function (row) {
            rows.appendChild(row);
          });
        } else {
          rows.appendChild(item);
        }
      }, this);
      return rows;
    },
    getGrid: function() {
      return this.grid;
    }
  };
  Components.utils.import("resource://grwmodules/Augment.jsm");
  augmentProto(Grid, GridProvider);
  GRW.UI.Grid = Grid;
})();
