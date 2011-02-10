(function () {
  Components.utils.import("resource://grwmodules/GridProvider.jsm");
  Components.utils.import("resource://grwmodules/Augment.jsm");

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
      Components.utils.import("resource://grwmodules/Prefs.jsm");
      if(Prefs.get.showitemsincontextmenu()) {
        var menu = this.menu,
            firstMenuItem,
            peopleYouFollow = this.peopleYouFollow;

        if (menu) {
          firstMenuItem = menu.firstChild;
          Components.utils.import("resource://grwmodules/Prefs.jsm");
          var generatedRows = this.genRows(this.feeds, Prefs.get.sortByLabels(), peopleYouFollow);
          generatedRows.forEach(function(item) {
            if (item.rows) {
              item.rows.forEach(function (row) {
                menu.insertBefore(row, firstMenuItem);
              });
            } else {
                menu.insertBefore(item, firstMenuItem);
            }
          }, this);
        }
        (this.feeds && this.feeds.length) ?  this.showMenuSeparator() : this.hideMenuSeparator();
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
      this.subscribe(GridStartGenRows, function () {
        _this.clearItems();
      });
    },
    genRow: function(item, isLabel) {
      var itemTitle  = item.data.title || item.data.displayName || '',
          itemCount  = item.count,
          doc        = this.document,
          menuitem = doc.createElement('menuitem');

      Components.utils.import("resource://grwmodules/Prefs.jsm");
      itemTitle = this.normalizeItemTitle(itemTitle,  Prefs.get.tooltipTitleLength());

      menuitem.setAttribute('label', itemCount + ' ' + itemTitle);
      menuitem.setAttribute('class', 'feed');
      menuitem.setAttribute('url', item.id);
      if(isLabel) {
        menuitem.setAttribute('class', 'tag');
      }
      var win = this.window;
      menuitem.addEventListener('command', function(){
        var href = this.getAttribute('url');
        if (typeof href !== 'undefined' && href !== 'undefined') {
          win.GRW.OpenReader.open(href);
        }
      }, false);
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
  Components.utils.import("resource://grwmodules/Augment.jsm");
  augmentProto(Menu, GridProvider);
  GRW.UI.Menu = Menu;
}());
