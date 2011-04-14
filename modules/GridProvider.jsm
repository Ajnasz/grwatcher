Components.utils.import("resource://grwmodules/EventProvider.jsm");
Components.utils.import("resource://grwmodules/Augment.jsm");

var sortFeeds = function (feeds) {
    feeds.sort(function(a, b) {
      if(a.data && b.data) {
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
    labelRows.sort(function(a, b) {
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


const GridStartGenRows = 'GridStartGenRows';
const GridFinishGenRows = 'GridFinishGenRows';
var GridProvider = function () {
};
GridProvider.prototype = {
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
  genRows: function (feeds, orderByLabels, peopleYouFollow) {
    var orderByLabels, labels, rows = [],
        peopleYouFollow;

    this.fireEvent(GridStartGenRows);

    if (feeds && feeds.length) {
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
    this.fireEvent(GridFinishGenRows, rows);
    return rows;
  },
  normalizeItemTitle: function (itemTitle, titlelength) {
    return itemTitle.length > titlelength
                  ? itemTitle.slice(0, titlelength - 3) + '...'
                  : itemTitle
  },
  getTitle: function (item) {
    var itemTitle = 'no title';
    // Components.utils.import("resource://grwmodules/GRWLog.jsm");
    // GRWlog('item type: ', typeof item);
    // GRWlog('item: ', item.toSource());
    if (item && item.data) {
      itemTitle = item.data.title || item.data.displayName || 'no title2';
    }

    Components.utils.import("resource://grwmodules/Prefs.jsm");
    itemTitle = this.normalizeItemTitle(itemTitle, Prefs.get.tooltipTitleLength());
    return itemTitle;
  }
};
augmentProto(GridProvider, EventProvider);
let EXPORTED_SYMBOLS = ['GridProvider', 'GridStartGenRows', 'GridFinishGenRows'];
