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
            generatedRows,
            sortedLabels, insert;
        // Components.utils.import("resource://grwmodules/GRWLog.jsm", scope);

        if (menu) {
          firstMenuItem = menu.firstChild;
          sortedLabels = scope.Prefs.get.sortByLabels();
          generatedRows = this.genRowItems(this.feeds, sortedLabels, peopleYouFollow);
          if (this.getPosition() === positions.bottom) {
            insert = this.insertBefore;
          } else {
            insert = this.insertAfter;
          }
          generatedRows.forEach(insert, this);
        }
        if (this.feeds && this.feeds.length) {
          this.showMenuSeparator();
        } else {
          this.hideMenuSeparator();
        }
      }
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
    genLabelRow: function (item, isLabel) {
      var itemTitle = this.getTitle(item),
          itemCount = item.count,
          doc = this.document,
          menuitem = doc.createElement('menuitem'),
          openReader = this.openReader;

      menuitem.setAttribute('label', itemCount + ' ' + itemTitle);
      menuitem.setAttribute('class', 'feed');
      menuitem.setAttribute('url', item.id);
      if (isLabel) {
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
      var menu = this.menu;
      if (menu) {
        for (let i = menu.childNodes.length - 1, rex = /feed|tag/, node; i >= 0; i -= 1) {
            node = menu.childNodes[i];
          if (rex.test(node.getAttribute('class'))) {
            menu.removeChild(node);
          }
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
