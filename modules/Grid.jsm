const _gridStartGenRows = '_gridStartGenRows';
const _gridFinishGenRows = '_gridFinishGenRows';
var _grid = function () {
};
_grid.prototype = {
  /**
    * That method should be overwritten
    * **/
  genRow: function () {},
  _normalizeLabelRows: function (feeds, peopleYouFollow) {
      var labels = {'-':{count: 0, rows: []}};
      labels[peopleYouFollow] = {count: 0, rows: []};
      feeds.forEach(function(item) {
        if (item.data) {
          var categories  = item.data.categories;

          if(categories && categories.length) {
            categories.forEach(function(category) {
              if(!labels[category.label]) {
                labels[category.label] = {count: 0, rows: [], id: category.id};
              }
              labels[category.label].rows.push(this.genRow(item));
              labels[category.label].count += item.count;
            }, this);
          } else if (item.data.displayName) {
            labels[peopleYouFollow].rows.push(this.genRow(item));
            labels[peopleYouFollow].count += item.count;
          } else {
            labels['-'].rows.push(this.genRow(item));
            labels['-'].count += item.count;
          }
        }
      }, this);
      return labels;
  },
  _genLabelRows: function (labels) {
      var _labelRows = [],
          _labelRow;

      for(let label in labels) {
        if(labels.hasOwnProperty(label)) {
          _labelRow = {label: label, rows: []};
          if (labels[label].count > 0) {
            _labelRow.rows.push(this.genRow({data: {title: label}, count: labels[label].count, id: labels[label].id}, true));
            labels[label].rows.forEach(function(row) {
              _labelRow.rows.push(row);
            });
            _labelRows.push(_labelRow);
          }
        }
      }
      return _labelRows;
  },
  genRows: function (feeds, peopleYouFollow) {
    var orderByLabels, labels, rows = [],
        peopleYouFollow;

    this.fireEvent(_gridStartGenRows);

    if (feeds && feeds.length) {
      orderByLabels = GRW.Prefs.get.sortByLabels();
      if (orderByLabels) {
        feeds = sortFeeds(feeds);
        labels = this._normalizeLabelRows(feeds, peopleYouFollow);
        rows = this._genLabelRows(labels);
        rows = sortLabelRows(rows, peopleYouFollow);

      } else {
        rows = feeds.map(function(item) {
          return this.genRow(item);
        }, this);

      }
    }
    this.fireEvent(_gridFinishGenRows, rows);
    return rows;
  },
  normalizeItemTitle: function (itemTitle) {
    return itemTitle.length > titlelength
                  ? itemTitle.slice(0, titlelength - 3) + '...'
                  : itemTitle
  }
};
