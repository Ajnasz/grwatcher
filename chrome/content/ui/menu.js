/*jslint indent:2*/
(function () {
  Components.utils.import("resource://grwmodules/GridProvider.jsm");
  Components.utils.import("resource://grwmodules/Augment.jsm");
  /*global GRW: true, Augment: true, GridStartGenRows*/

  var Menu = function (win, feeds, labels, menu, menuseparator, openReader) {
    var doc = win.document;
    this.window = win;
    this.document = doc;
    this.feeds = feeds;
    this.menu = doc.getElementById(menu);
    this.menuseparator = menuseparator;
    this.labels = labels;
    this.peopleYouFollow = GRW.strings.getString('peopleyoufollowtitle');
    this.openReader = openReader;
    this.initEvents();
    this.init();
  };
  Menu.prototype = {
    init: function () {
      this.clearItems();
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      /*global Prefs: true*/
      if (Prefs.get.showitemsincontextmenu()) {
        var menu = this.menu,
            firstMenuItem,
            peopleYouFollow = this.peopleYouFollow,
            generatedRows,
            sortedLabels;

        if (menu) {
          firstMenuItem = menu.firstChild;
          sortedLabels = Prefs.get.sortByLabels();
          generatedRows = this.genRows(this.feeds, sortedLabels, peopleYouFollow);
          generatedRows.forEach(function (item) {
            if (item.rows) {
              item.rows.forEach(function (row) {
                menu.insertBefore(row, firstMenuItem);
              });
            } else {
              menu.insertBefore(item, firstMenuItem);
            }
          }, this);
        }
        if (this.feeds && this.feeds.length) {
          this.showMenuSeparator();
        } else {
          this.hideMenuSeparator();
        }
      }
    },
    showMenuSeparator: function () {
      var menuSeparator = this.document.getElementById(this.menuseparator);
      if (menuSeparator) {
        menuSeparator.setAttribute('class', '');
      }
    },
    hideMenuSeparator: function () {
      var menuSeparator = this.document.getElementById(this.menuseparator);
      if (menuSeparator) {
        menuSeparator.setAttribute('class', 'grw-hidden');
      }
    },
    initEvents: function () {
      var _this = this;
      this.subscribe(GridStartGenRows, function () {
        _this.clearItems();
      });
    },
    genRow: function (item, isLabel) {
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
        for (let i = menu.childNodes.length-1, rex = new RegExp('feed|tag'), node; i >= 0; i -= 1) {

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
  Components.utils.import("resource://grwmodules/Augment.jsm");
  augmentProto(Menu, GridProvider);
  GRW.UI.Menu = Menu;
}());
