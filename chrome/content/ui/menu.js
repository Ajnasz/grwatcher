/*jslint indent:2*/
/*global Components:true*/
(function () {
  var positions = {
    top: 1,
    bottom: 2
  }
  var scope = {}, Menu;
  Components.utils.import("resource://grwmodules/GridProvider.jsm", scope);
  Menu = function (win, feeds, labels, menu, menuseparator, openReader) {
    var doc = win.document, strings;
    this.window = win;
    this.document = doc;
    this.feeds = feeds;
    this.menu = doc.getElementById(menu);
    this.menuseparator = menuseparator;
    this.labels = labels;
    strings = document.getElementById('grwatcher-strings');
    this.peopleYouFollow = strings.getString('peopleyoufollowtitle');
    this.openReader = openReader;
    this.initEvents();
    this.init();
  };
  Menu.prototype = {
    init: function () {
      this.clearItems();
      Components.utils.import("resource://grwmodules/Prefs.jsm", scope);
      if (scope.Prefs.get.showitemsincontextmenu()) {
        var menu = this.menu,
            firstMenuItem,
            peopleYouFollow = this.peopleYouFollow,
            isBottom = this.getPosition() === positions.bottom,
            labelRows, controlRows,
            sortedLabels, insert;
        // Components.utils.import("resource://grwmodules/GRWLog.jsm", scope);

        if (menu) {
          firstMenuItem = menu.firstChild;
          sortedLabels = scope.Prefs.get.sortByLabels();
          labelRows = this.genRowItems(this.feeds, sortedLabels, peopleYouFollow);
          controlRows = this.genControlRows(isBottom);
          if (isBottom) {
            insert = this.insertBefore.bind(this);
          } else {
            insert = this.insertAfter.bind(this);
          }
          controlRows.forEach(this.insertBefore.bind(this));
          if (labelRows) {
            insert(this.genMenuSeparator());
            labelRows.forEach(insert, this);
          }
        }
        /*
        if (this.feeds && this.feeds.length) {
          this.showMenuSeparator();
        } else {
          this.hideMenuSeparator();
        }
        */
      }
    },
    genMenuSeparator: function () {
      var element = this.document.createElement('menuseparator');
      element.setAttribute('id', 'GRW-toolbar-menuseparator');
      return element;
    },
    genControlRows: function (isBottom) {
      var strings = this.document.getElementById('grwatcher-strings'),
          conf = [
          {
            label: strings.getString('toolbarpopupmarkallasread'),
            id: 'GRW-toolbar-menuitem-markallasread'
          },
          {
            label: strings.getString('toolbarpopupopenreader'),
            id: "GRW-toolbar-menuitem-openreader"
          },
          {
            label: strings.getString('toolbarpopupopenprefs'),
            id: 'GRW-toolbar-menuitem-openprefs'
          },
          {
            label: strings.getString('toolbarpopupgetreadcounter'),
            id: 'GRW-toolbar-menuitem-getcounter'
          }
        ],
        rows = [];
      if (isBottom) {
        conf.reverse();
      }
      conf.forEach(function (item) {
        rows.push(this.genMenuItem(item.label, item.id));
      }.bind(this));
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
    insertBefore: function (item) {
      var menu = this.menu,
          firstMenuItem = menu.firstChild;

      if (item.rows) {
        item.rows.forEach(function (row) {
          menu.insertBefore(row, firstMenuItem);
        });
      } else {
        menu.insertBefore(item, firstMenuItem);
      }
    },
    getPosition: function () {
      var output = positions.top;
      if (this.menu.parentNode.parentNode.id === 'addon-bar') {
        output = positions.bottom;
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
        method = show ? this._showMenuSeparator.bind(this) : this._hideMenuSeparator.bind(this);
      if (typeof menuseparator !== 'object') {
        menuseparator = [menuseparator];
      }
      menuseparator.forEach(function (item) {
        var menuSeparator = this.document.getElementById(item);
        method(menuSeparator);
      }.bind(this));
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
          menuitem,
          classes = ['feed'],
          openReader = this.openReader;

      menuitem = this.genMenuItem(itemCount + ' ' + itemTitle,
        'menuitem-' + item.id, classes, item.id);
      if (isLabel) {
        classes.push('tag');
        menuitem.setAttribute('class', 'tag');
      }
      menuitem.addEventListener('command', function () {
        var href = this.getAttribute('url');
        if (typeof href !== 'undefined' && href !== 'undefined') {
          openReader.open(href);
        }
      }, false);
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
  Components.utils.import("resource://grwmodules/Augment.jsm", scope);
  scope.augmentProto(Menu, scope.GridProvider);
  GRW.UI.Menu = Menu;
}());
