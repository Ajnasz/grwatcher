/*jslint indent:2*/
/*global Components:true*/
var iconPositions = {
  top: 1,
  bottom: 2
},
// create regexps only once
menuItemFixRexes = {
    invalidChars: /[^\w_\-]/g,
    protocol: /https?:\/\/(?:www)?/,
    duplicateChars: /_+/g
};
var scope = {}, GrwMenu;
GrwMenu = function (win, feeds, labels, menu, barname) {
  var doc = win.document, strings;
  this.barname = barname;
  this.window = win;
  this.document = doc;
  this.feeds = feeds;
  this.menu = doc.getElementById(menu);
  this.labels = labels;
  strings = this.document.getElementById('grwatcher-strings');
  this.peopleYouFollow = strings.getString('peopleyoufollowtitle');
  this.initEvents();
  this.init();
};
GrwMenu.prototype = {
  init: function () {
    this.clearItems();
    Components.utils.import("resource://grwmodules/prefs.jsm", scope);

    var menu = this.menu,
        peopleYouFollow = this.peopleYouFollow,
        isBottom = this.getPosition() === iconPositions.bottom,
        isStatusbar = this.isStatusbar(),
        labelRows, controlRows, sortedLabels;

    if (menu) {
      controlRows = this.genControlRows();

      if (scope.prefs.get.showitemsincontextmenu()) {
        sortedLabels = scope.prefs.get.sortByLabels();
        labelRows = this.genRowItems(this.feeds, sortedLabels, peopleYouFollow);
        if (labelRows) {
          controlRows.push(this.genMenuSeparator());
          controlRows = controlRows.concat(labelRows);
        }
      }
      if (isBottom || isStatusbar) {
        controlRows.reverse();
      }
      controlRows.forEach(function (item) {
        this.insertAfter(item);
      }, this);
    }
  },
  genMenuSeparator: function () {
    var element = this.document.createElement('menuseparator');
    element.setAttribute('id', 'GRW-' + this.barname + '-menuseparator');
    return element;
  },
  genControlRows: function () {
    var strings = this.document.getElementById('grwatcher-strings'),
        conf = [
        {
          label: strings.getString('toolbarpopupgetreadcounter'),
          id: 'GRW-' + this.barname + '-menuitem-getcounter'
        },
        {
          label: strings.getString('toolbarpopupopenprefs'),
          id: 'GRW-' + this.barname + '-menuitem-openprefs'
        },
        {
          label: strings.getString('toolbarpopupopenreader'),
          id: 'GRW-' + this.barname + '-menuitem-openreader'
        },
        {
          label: strings.getString('toolbarpopupmarkallasread'),
          id: 'GRW-' + this.barname + '-menuitem-markallasread'
        }
      ],
      _this = this,
      rows = [];
    conf.forEach(function (item) {
      rows.push(_this.genMenuItem(item.label, item.id));
    });
    return rows;
  },
  insertAfter: function (item) {
    var menu = this.menu,
        lastMenuItem = menu.lastChild;

    if (item.rows) {
      item.rows.forEach(function (row) {
        menu.appendChild(row);
      });
    } else {
      menu.appendChild(item);
    }
  },
  isStatusbar: function () {
    return this.menu.id === 'GRW-statusbar-menu';
  },
  getPosition: function () {
    var output = iconPositions.top;
    if (this.menu.parentNode.parentNode.id === 'addon-bar') {
      output = iconPositions.bottom;
    }
    return output;
  },
  _showMenuSeparator: function (menuSeparator) {
    if (menuSeparator) {
      menuSeparator.setAttribute('class', '');
    }
  },
  _hideMenuSeparator: function (menuSeparator) {
    if (menuSeparator) {
      menuSeparator.setAttribute('class', 'grw-hidden');
    }
  },
  processMenuSeparator: function (show) {
    var menuseparator = this.menuseparator,
      _this = this,
      method = show ? function (item) {
        _this._showMenuSeparator(item);
      } : function (item) {
        _this._hideMenuSeparator(item);
      };
    if (typeof menuseparator !== 'object') {
      menuseparator = [menuseparator];
    }
    menuseparator.forEach(function (item) {
      var menuSeparator = _this.document.getElementById(item);
      method(menuSeparator);
    });
  },
  showMenuSeparator: function () {
    this.processMenuSeparator(true);
  },
  hideMenuSeparator: function () {
    this.processMenuSeparator(true);
  },
  initEvents: function () {
    var _this = this;
    this.subscribe(scope.GridStartGenRows, function () {
      _this.clearItems();
    });
  },
  genMenuItem: function (label, id, cl, url) {
    var menuitem = this.document.createElement('menuitem'),
        classes = this.getClass(cl);
    id = id.replace(menuItemFixRexes.protocol, '').replace(menuItemFixRexes.invalidChars, '_').replace(menuItemFixRexes.duplicateChars, '_');
    if (classes) {
      menuitem.setAttribute('class', classes);
    }
    if (url) {
      menuitem.setAttribute('url', url);
    }
    menuitem.setAttribute('id', id);
    menuitem.setAttribute('label', label);
    return menuitem;
  },
  genLabelRow: function (item, isLabel) {
    var itemTitle = this.getTitle(item),
        itemCount = item.count,
        doc = this.document,
        classes = ['feed'],
        openReader = this.openReader,
        that = this,
        menuitem;

    menuitem = this.genMenuItem(itemCount + ' ' + itemTitle,
      'GRW-menuitem-' + item.id, classes, item.id);
    if (isLabel) {
      classes.push('tag');
      menuitem.setAttribute('class', 'tag');
    }
    return menuitem;
  },
  clearItems: function () {
    var menu = this.menu, i;
    if (menu) {
      for (i = menu.childNodes.length - 1; i >= 0; i -= 1) {
        menu.removeChild(menu.childNodes[i]);
      }
    }
    this.hideMenuSeparator();
    return true;
  }
};
Components.utils.import("resource://grwmodules/augment.jsm", scope);
Components.utils.import("resource://grwmodules/GridProvider.jsm", scope);
scope.augmentProto(GrwMenu, scope.GridProvider);
let EXPORTED_SYMBOLS = ['GrwMenu'];
