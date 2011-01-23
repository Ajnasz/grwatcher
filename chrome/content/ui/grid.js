(function() {
  const maxTitlelenth = 5,
      titlelength   = GRW.Prefs.get.tooltipTitleLength();
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
  GRW.augmentProto(_grid, GRW.EventProvider);
  var Grid = function(doc, feeds, labels) {
    this.document = doc;
    this.feeds = feeds || [];
    // this.getlist = getlist;
    this.toLeft = GRW.Prefs.get.tooltipCounterPos() == 'left';
    this.labels = labels;
    this.peopleYouFollow = GRW.strings.getString('peopleyoufollowtitle');
    // this.on(_gridStartGenRows)
    // this.on(_gridFinishGenRows)
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
      var itemTitle  = item.data.title || item.data.displayName || '',
          itemCount  = item.count,
          doc        = this.document,
          label      = doc.createElement('label'),
          row        = doc.createElement('row'),
          countLabel = label.cloneNode(true),
          titleLabel = label.cloneNode(true);

      itemTitle = this.normalizeItemTitle(itemTitle);

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
      var generatedRows = this.genRows(this.feeds, this.peopleYouFollow);
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
  GRW.augmentProto(Grid, _grid);
  var Menu = function(win, feeds, labels, menu, menuseparator) {
    var doc = win.document;
    this.window = win;
    this.document = doc;
    this.feeds = feeds;
    this.menu = doc.getElementById(menu);
    this.menuseparator = menuseparator;
    this.labels = labels;
    this.peopleYouFollow = GRW.strings.getString('peopleyoufollowtitle');
    this.initEvents();
    this.init();
  };
  Menu.prototype = {
    init: function() {
      this.clearItems();
      if(GRW.Prefs.get.showitemsincontextmenu()) {
        var menu = this.menu,
            firstMenuItem,
            peopleYouFollow = this.peopleYouFollow;

        if (menu) {
          firstMenuItem = menu.firstChild;
        }
        var generatedRows = this.genRows(this.feeds, peopleYouFollow);
        generatedRows.forEach(function(item) {
          if (item.rows) {
            item.rows.forEach(function (row) {
              menu.insertBefore(row, firstMenuItem);
            });
          } else {
              menu.insertBefore(item, firstMenuItem);
          }
        }, this);
        (this.feeds.length) ?  this.showMenuSeparator() : this.hideMenuSeparator();
      }
    },
    showMenuSeparator: function () {
      var menuSeparator = this.document.getElementById(this.menuseparator);
      if(menuSeparator) {
        menuSeparator.setAttribute('class', '');
      }
    },
    hideMenuSeparator: function () {
      var menuSeparator = this.document.getElementById(this.menuseparator);
      if(menuSeparator) {
        menuSeparator.setAttribute('class', 'grw-hidden');
      }
    },
    initEvents: function () {
      var _this = this;
      this.subscribe(_gridStartGenRows, function () {
        _this.clearItems();
      });
    },
    genRow: function(item, isLabel) {
      var itemTitle  = item.data.title || item.data.displayName || '',
          itemCount  = item.count,
          doc        = this.document,
          menuitem = doc.createElement('menuitem');

      itemTitle = itemTitle.length > titlelength
                    ? itemTitle.slice(0, titlelength - 3) + '...'
                    : itemTitle;

      menuitem.setAttribute('label', itemCount + ' ' + itemTitle);
      menuitem.setAttribute('class', 'feed');
      menuitem.setAttribute('url', item.id);
      if(isLabel) {
        menuitem.setAttribute('class', 'tag');
      }
      var win = this.window;
      menuitem.addEventListener('command', function(){win.GRW.OpenReader.open(this.getAttribute('url'));}, false);
      return menuitem;
    },
    clearItems: function() {
      var menu = this.menu;
      if (menu) {
        for(let i = menu.childNodes.length-1, rex = new RegExp('feed|tag'), node; i >= 0; i--) {

            node = menu.childNodes[i];

          if(rex.test(node.getAttribute('class'))) {
            menu.removeChild(node);
          }
        }
      }
      this.hideMenuSeparator();
      return true;
    }
  };
  GRW.augmentProto(Menu, _grid);
  GRW.UI.Grid = Grid;
  GRW.UI.Menu = Menu;
})();
