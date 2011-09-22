/*jslint indent:2*/
/*global Components: true*/
var scope = {};
Components.utils.import("resource://grwmodules/EventProvider.jsm", scope);
Components.utils.import("resource://grwmodules/augment.jsm", scope);

var sortFeeds = function (feeds) {
  feeds.sort(function (a, b) {
    if (a.data && b.data) {
      if (a.data.title && b.data.title) {
        return a.data.title.toLowerCase() > b.data.title.toLowerCase();
      } else if (a.data.displayName) {
        return -1;
      } else if (b.data.displayName) {
        return 1;
      }
    }
  });
  return feeds;
};

var sortLabelRows = function (labelRows, mustBeFirst) {
  labelRows.sort(function (a, b) {
    if (a.label === mustBeFirst) {
      return -1;
    } else if (b.label === mustBeFirst) {
      return 1;
    } else {
      return a.label.toLowerCase() > b.label.toLowerCase();
    }
  });
  return labelRows;
};

var GridStartGenRows = 'GridStartGenRows';
var GridFinishGenRows = 'GridFinishGenRows';
var GridProvider = function () {
};
GridProvider.prototype = {
  _normalizeLabelRows: function (feeds, peopleYouFollow) {
    var labels = {'-': {count: 0, rows: []}};
    labels[peopleYouFollow] = {count: 0, rows: []};
    feeds.forEach(function (item) {
      if (item.data) {
        var categories = item.data.categories, row;
        row = this.genLabelRow(item);

        if (categories && categories.length) {
          categories.forEach(function (category) {
            if (!labels[category.label]) {
              labels[category.label] = {count: 0, rows: [], id: category.id};
            }
            labels[category.label].rows.push(row);
            labels[category.label].count += item.count;
          }, this);
        } else if (item.data.displayName) {
          labels[peopleYouFollow].rows.push(row);
          labels[peopleYouFollow].count += item.count;
        } else {
          labels['-'].rows.push(row);
          labels['-'].count += item.count;
        }
      }
    }, this);
    return labels;
  },
  _genLabelRows: function (labels) {
    var _labelRows = [],
        _labelRow, label, putToRows, arow;

    putToRows = function (row) {
      this.push(row);
    };
    for (label in labels) {
      if (labels.hasOwnProperty(label)) {
        _labelRow = {label: label, rows: []};
        if (labels[label].count > 0) {
          _labelRow.rows.push(this.genLabelRow({
            data: {
              title: label
            },
            count: labels[label].count,
            id: labels[label].id
          }, true));
          labels[label].rows.forEach(putToRows.bind(_labelRow.rows));
          _labelRows.push(_labelRow);
        }
      }
    }
    return _labelRows;
  },
  genRowItems: function (feeds, orderByLabels, peopleYouFollow) {
    var labels, rows, sortedFeeds;

    this.fireEvent(GridStartGenRows);

    if (feeds && feeds.length) {
      if (orderByLabels) {
        sortedFeeds = sortFeeds(feeds);
        labels = this._normalizeLabelRows(sortedFeeds, peopleYouFollow);
        rows = this._genLabelRows(labels);
        rows = sortLabelRows(rows, peopleYouFollow);
      } else {
        rows = feeds.map(function (item) {
          return this.genLabelRow(item);
        }, this);
      }
    }
    this.fireEvent(GridFinishGenRows, rows);
    return rows;
  },
  normalizeItemTitle: function (itemTitle, titlelength) {
    return itemTitle.length > titlelength ? itemTitle.slice(0, titlelength - 3) + '...' : itemTitle;
  },
  getClass: function (cl) {
    var clType = typeof cl,
        classes = '';
    if (cl) {
      if (clType === 'string') {
        classes = cl;
      } else if (clType === 'object' && cl.length > 0) {
        classes = cl.join(' ');
      }
    }
    return classes;
  },
  getTitle: function (item) {
    var itemTitle = 'no title';
    // Components.utils.import("resource://grwmodules/grwlog.jsm", scope);
    // scope.grwlog('item type: ', typeof item);
    // scope.grwlog('item: ', item.toSource());
    if (item && item.data) {
      itemTitle = item.data.title || item.data.displayName || 'no title2';
    }

    Components.utils.import("resource://grwmodules/prefs.jsm", scope);
    itemTitle = this.normalizeItemTitle(itemTitle, scope.prefs.get.tooltipTitleLength());
    return itemTitle;
  }
};
scope.augmentProto(GridProvider, scope.EventProvider);
let EXPORTED_SYMBOLS = ['GridProvider', 'GridStartGenRows', 'GridFinishGenRows'];
