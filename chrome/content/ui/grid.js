/*jslint indent:2*/
/*global Components: true*/
(function () {
  var scope = {};
  var Grid = function (doc, feeds, labels) {
    this.document = doc;
    this.feeds = feeds || [];
    // this.getlist = getlist;
    Components.utils.import("resource://grwmodules/Prefs.jsm", scope);
    this.toLeft = scope.Prefs.get.tooltipCounterPos() === 'left';
    this.labels = labels;
    var strings = document.getElementById('grwatcher-strings');
    this.peopleYouFollow = strings.getString('peopleyoufollowtitle');
    this.init();
  };
  Grid.prototype = {
    init: function () {
      var doc = this.document,
          grid = doc.createElement('grid'),
          columns = doc.createElement('columns'),
          column = doc.createElement('column'),
          columnc1, columnc2;


      grid.flex = 1;
      grid.id = '';

      columnc1 = column.cloneNode(true);
      columnc1.flex = 1;
      columnc2 = column.cloneNode(true);

      columns.appendChild(columnc1);
      columns.appendChild(columnc2);

      grid.appendChild(columns);
      grid.appendChild(this.genRows());

      this.grid = grid;
    },
    genLabel: function (value, cl) {
      var lbl = this.document.createElement('label');
      lbl.value = value;
      lbl.setAttribute('class', this.getClass(cl));
      return lbl;
    },
    genRow: function (labels, cl) {
      var row = this.document.createElement('row'),
          rowLabels = typeof labels === 'string' ? [{value: labels}] : labels,
          rowClass = this.getClass(cl),
          _this = this;

      rowLabels.forEach(function (lbl) {
        row.appendChild(_this.genLabel(lbl.value, lbl.cl));
      });

      if (rowClass !== '') {
        row.setAttribute('class', this.getClass(cl));
      }

      return row;
    },
    genLabelRow: function (item, isTag) {
      var labels = [{value: item.count, cl: 'counterCol'}],
          titleLabel = {value: this.getTitle(item)},
          rowClasses = isTag ? 'tag' : '';

      if (this.toLeft) {
        labels.push(titleLabel);
      } else {
        labels.unshift(titleLabel);
      }

      return this.genRow(labels, rowClasses);
    },
    genRows: function () {
      var rows = this.document.createElement('rows'),
          generatedRows;
      Components.utils.import("resource://grwmodules/Prefs.jsm", scope);
      Components.utils.import("resource://grwmodules/GRWLog.jsm", scope);
      generatedRows = this.genRowItems(this.feeds,
        scope.Prefs.get.sortByLabels(), this.peopleYouFollow);
      generatedRows.forEach(function (item) {
        if (item.rows) {
          item.rows.forEach(function (row) {
            scope.grwlog(row.nodeName);
            rows.appendChild(row);
          });
        } else {
          rows.appendChild(item);
        }
      }, this);
      return rows;
    },
    getGrid: function () {
      return this.grid;
    }
  };
  Components.utils.import("resource://grwmodules/Augment.jsm", scope);
  Components.utils.import("resource://grwmodules/GridProvider.jsm", scope);

  scope.augmentProto(Grid, scope.GridProvider);
  GRW.UI.Grid = Grid;
}());
