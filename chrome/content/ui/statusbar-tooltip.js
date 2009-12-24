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
          rows = this.document.createElement('rows'),
          row;

      var titlelength = (titlelength > maxTitlelenth) ? titlelength : maxTitlelenth;

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
  var statusbarID = 'GRW-statusbar',
      toolbarButtonID = 'GRW-toolbar-button';
  var actions = {
    genGrid: function(win, feeds, getlist) {
      var statusbar = win.document.getElementById(statusbarID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-new';
        var tooltipContainer = win.document.getElementById('GRW-statusbar-tooltip-new');
        var grid = new Grid(win.document, feeds, getlist).getGrid();
        while(tooltipContainer.firstChild) {
          tooltipContainer.removeChild(tooltipContainer.firstChild);
        }
        tooltipContainer.appendChild(grid);
      }
    },
    error: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-error';
        if(ttb)ttb.setAttribute('tooltiptext', GRW.strings.getString('errorfeedfetch'));
      }
    },
    nonew: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-nonew';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('nonewfeed'));
      }
    },
    cookieError: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-cookieerror';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('cookieerror'));
      }
    },
    networkError: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-networkerror';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('networkerror'));
      }
    },
    loginError: function(win) {
      var statusbar = win.document.getElementById(statusbarID);
      var ttb = win.document.getElementById(toolbarButtonID);
      if(statusbar) {
        statusbar.tooltip = 'GRW-statusbar-tooltip-loginerror';
        if(ttb) ttb.setAttribute('tooltiptext', GRW.strings.getString('errorlogin'));
      }
    },
  };
  var statusbarTooltip = function(action, feeds, getlist) {
    var actionMethod;
    switch(action) {
      case 'grid':
        actionMethod = actions.genGrid;
        break;

      case 'error':
        actionMethod = actions.error;
        break;

      case 'cookieerror':
        actionMethod = actions.cookieError;
        break;

      case 'networkerror':
        actionMethod = actions.networkError;
        break;

      case 'loginerror':
        actionMethod = actions.loginError;
        break;
    }
    if(actionMethod) {
      GRW.UI.MapWindows(actionMethod, [feeds, getlist]);
    }
  };
  GRW.UI.StatusbarTooltip = statusbarTooltip;
})();
