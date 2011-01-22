(function() {
  const maxTitlelenth = 5,
      titlelength   = GRW.Prefs.get.tooltipTitleLength();

  var Grid = function(doc, feeds, labels) {
    this.document = doc;
    this.feeds = feeds || [];
    // this.getlist = getlist;
    this.toLeft = GRW.Prefs.get.tooltipCounterPos() == 'left';
    this.orderByLabels = GRW.Prefs.get.sortByLabels();
    this.labels = labels;
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

      rows = this.genRows();

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

      itemTitle = itemTitle.length > titlelength
                    ? itemTitle.slice(0, titlelength - 3) + '...'
                    : itemTitle;

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
    genRows: function() {
      var feeds = this.feeds,
          rows = this.document.createElement('rows'),
          row;

      // GRW.log('feeds: ', feeds.toSource());

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

      if(this.orderByLabels) {
        if(feeds.length) {
          var labels = {'-':{count: 0, rows: []}, 'People you follow':{count: 0, rows: []}};

          feeds.forEach(function(item) {
            if (item.data) {

              var categories  = item.data.categories;

              if(categories && categories.length) {

                categories.forEach(function(category) {

                  if(!labels[category.label]) {
                    labels[category.label] = {count: 0, rows: []};
                  }

                  labels[category.label].rows.push(this.genRow(item));
                  labels[category.label].count += item.count;

                }, this);

              } else if (item.data.displayName) {
                labels['People you follow'].rows.push(this.genRow(item));
                labels['People you follow'].count += item.count;
              } else {

                labels['-'].rows.push(this.genRow(item));
                labels['-'].count += item.count;

              }
            }


          }, this);
          var _labelRows = [],
              _labelRow;
          for(var label in labels) {
            if(labels.hasOwnProperty(label)) {
              _labelRow = {label: label, rows: []};
              _labelRow.rows.push(this.genRow({data: {title: label}, count: labels[label].count}, true));
              // rows.appendChild();
              labels[label].rows.forEach(function(row) {

                _labelRow.rows.push(row);
              });
              _labelRows.push(_labelRow);
            }
          }
          _labelRows.sort(function(a, b) {
            if (a.label === 'People you follow') {
              return -1;
            } else if (b.label === 'People you follow') {
              return 1;
            } else {
              return a.label.toLowerCase() > b.label.toLowerCase();
            }
          });
          _labelRows.forEach(function(labelRow) {
            labelRow.rows.forEach(function(row) {
              rows.appendChild(row);
            })
          });
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
  var Menu = function(win, feeds, labels, menu, menuseparator) {
    var doc = win.document;
    this.window = win;
    this.document = doc;
    this.feeds = feeds;
    this.orderByLabels = GRW.Prefs.get.sortByLabels();
    this.menu = doc.getElementById(menu);
    this.menuseparator = menuseparator;
    this.labels = labels;
    this.init();
  };
  Menu.prototype = {
    init: function() {
      this.genRows();
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
    genRows: function() {
      this.clearItems();
      if(GRW.Prefs.get.showitemsincontextmenu()) {
        var menu = this.menu,
            firstMenuItem,
            feeds;

        if (menu) {
          firstMenuItem = menu.firstChild;
        }

        feeds = this.feeds;
        if (feeds) {
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

          if(this.orderByLabels) {
            if(feeds.length) {
              var labels = {'-':{count: 0, rows: []}, 'People you follow':{count: 0, rows: []}};

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
                    labels['People you follow'].rows.push(this.genRow(item));
                    labels['People you follow'].count += item.count;
                  } else {
                    labels['-'].rows.push(this.genRow(item));
                    labels['-'].count += item.count;
                  }
                }
              }, this);

              var _labelRows = [],
                  _labelRow;

              for(let label in labels) {
                if(labels.hasOwnProperty(label)) {
                  _labelRow = {label: label, rows: []};
                  _labelRow.rows.push(this.genRow({data: {title: label}, count: labels[label].count, id: labels[label].id}, true));

                  labels[label].rows.forEach(function(row) {
                    _labelRow.rows.push(row);
                  });
                  _labelRows.push(_labelRow);
                }
              }
              _labelRows.sort(function(a, b) {
                if (a.label === 'People you follow') {
                  return -1;
                } else if (b.label === 'People you follow') {
                  return 1;
                } else {
                  return a.label.toLowerCase() > b.label.toLowerCase();
                }
              });
              if (firstMenuItem) {
                _labelRows.forEach(function(_labelRow) {
                  _labelRow.rows.forEach(function(row) {
                    menu.insertBefore(row, firstMenuItem);
                  })
                });
              }
            }

          } else {
            if (firstMenuItem) {
              feeds.forEach(function(item) {
                menu.insertBefore(this.genRow(item), firstMenuItem);
              }, this);
            }
          }
          if(feeds.length) {
            var menuSeparator = this.document.getElementById(this.menuseparator);
            if(menuSeparator) {
              menuSeparator.setAttribute('class', '');
            }
          }
        }
      }
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
      var menuSeparator = this.document.getElementById(this.menuseparator);
      if(menuSeparator) {
        menuSeparator.setAttribute('class', 'grw-hidden');
      }
      return true;
    }
  };
  GRW.UI.Grid = Grid;
  GRW.UI.Menu = Menu;
})();
