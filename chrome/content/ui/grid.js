(function() {
  const maxTitlelenth = 5,
      titlelength   = GRW.Prefs.get.tooltipTitleLength();

  Grid = function(doc, feeds, getlist) {
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


      if(this.orderByLabels) {
        if(feeds.length) {
          var labels = {'-':{count: 0, rows: []}};

          feeds.forEach(function(item) {

              var categories  = item.data.categories;

              if(categories.length) {

                categories.forEach(function(category) {

                  if(!labels[category.label]) {
                    labels[category.label] = {count: 0, rows: []};
                  }

                  labels[category.label].rows.push(this.genRow(item));
                  labels[category.label].count += item.count;

                }, this);

              } else {

                labels['-'].rows.push(this.genRow(item));
                labels['-'].count += item.count;

              }


          }, this);

          for(var label in labels) {
            rows.appendChild(this.genRow({data: {title: label}, count: labels[label].count}, true));
            labels[label].rows.forEach(function(row) {rows.appendChild(row)});
          }
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
  Menu = function(doc, feeds, getlist) {
    this.document = doc;
    this.feeds = feeds;
    this.getlist = getlist;
    this.orderByLabels = GRW.Prefs.get.sortByLabels();
    this.menu = doc.getElementById('GRW-statusbar-menu');
    if(this.orderByLabels) {
      this.labels = getlist.getLabels();
    }
    this.init();
  };
  Menu.prototype = {
    init: function() {
      this.genRows();
      /*
      var doc = this.document,
          menuitem = doc.createElement('menuitem'), menuitemc,
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


      grid.appendChild(columnc1);
      grid.appendChild(columnc2);
      grid.appendChild(rows);
      this.grid = grid;
      */
    },
    genRow: function(item, isLabel) {
      var itemTitle  = item.data.title,
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
      return menuitem;
    },
    genRows: function() {
      if(GRW.Prefs.get.showitemsincontextmenu()) {
        this.clearItems();
        var menu = this.menu,
            firstMenuItem = menu.firstChild,
            feeds = this.feeds;


        if(this.orderByLabels) {
          if(feeds.length) {
            var labels = {'-':{count: 0, rows: []}};

            feeds.forEach(function(item) {
              var categories  = item.data.categories;

              if(categories.length) {
                categories.forEach(function(category) {
                  if(!labels[category.label]) {
                    labels[category.label] = {count: 0, rows: []};
                  }
                  labels[category.label].rows.push(this.genRow(item));
                  labels[category.label].count += item.count;
                }, this);
              } else {
                labels['-'].rows.push(this.genRow(item));
                labels['-'].count += item.count;
              }
            }, this);

            for(var label in labels) {
              if(labels.hasOwnProperty(label)) {
                menu.insertBefore(this.genRow({data: {title: label}, count: labels[label].count}, true), firstMenuItem);
                labels[label].rows.forEach(function(row) {
                  GRW.log('roowww', row.label);
                  menu.insertBefore(row, firstMenuItem)
                });
              }
            }
          }

        } else {
          feeds.forEach(function(item) {
            menu.insertBefore(this.genRow(item), firstMenuItem);
          }, this);
        }
        if(feeds.length) {
          this.document.getElementById('GRW-menuseparator').setAttribute('class', '');
        } else {
          this.document.getElementById('GRW-menuseparator').setAttribute('class', 'grw-hidden');
        }
      }
    },
    clearItems: function() {
      for(var menu = this.menu, i = menu.childNodes.length-1, rex = new RegExp('feed|tag'), node; i >= 0; i--) {

          node = menu.childNodes[i];

        if(rex.test(node.getAttribute('class'))) {
          menu.removeChild(node);
        }
      }
      return true;
    }
  };

/*
  var getUnreadList = function(type, doc, feeds, getlist) {
    if(type == 'menu') {
      return new Menu(doc, feeds, getlist).getGrid();
    } else {
      return new Grid(win.document, feeds, getlist).getGrid();
    }
  };
  GRW.UI.getUnreadList = getUnreadList;
  */

})();
