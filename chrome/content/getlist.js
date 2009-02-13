/**
 * This class will retreive, process, sort the user feeds
 * @requires chrome/content/grwatcher.js
 * @requires chrome/content/preferences.js
 * @requires defaults/preferences/grwatcher.js
 * @constructor
 * @class GetLIst
 */
var GetList = function(getuserid) {
  this.getuserid = getuserid;
  if(this.getuserid) {
    this.getReadCounter();
  } else {
    this.getFeedList();
  }
  try {
    this.nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
  } catch(e) {this.nativeJSON = null;}
};
GetList.prototype = {
  subscriptionsList: null,
  FeedlistIds: null,
  unreadCount: null,
  maxCount: null,
  feeds: null,
  userFeeds: null,
  /**
   * Receives the users subscriptbion list
   */
  getFeedList: function() {
    var THIS = this;
    new Ajax({
      url: GRStates.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',
      // url: GRStates.conntype + '://www.googler.com/reader/api/0/subscription/list?output=json',
      successHandler: function(request) {
        THIS.subscriptionsList = THIS.decodeJSON(this.req.responseText).subscriptions;
        THIS.onFeedListLoad(this.req);
      }
    });
  },
  /**
   * @param {XMLHtpRequest} request ajax response object
   * @type {Array}
   */
  onFeedListLoad: function(request) {
    var ids = new Array();
    this.subscriptionsList.forEach(function(d) {
      ids.push(d.id);
    });
    this.FeedlistIds = ids;
    this.getReadCounter();
    return ids;
  },
  /**
   * request for unreaded feeds
   */
  getReadCounter: function() {
    var THIS = this;
    new Ajax({
      url: GRStates.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      successHandler: function() {
        var data = THIS.decodeJSON(this.req.responseText);
        THIS.unreadCount = data.unreadcounts;
        THIS.maxCount = GRW_StatusBar.maxCount = data.max;
        THIS.feeds = new Array();
        THIS.userFeeds = new Array();
        var rex1 = new RegExp('^(?:user/\\d+/state/com.google/broadcast-friends|feed)'), rex2 = new RegExp('^user\/([^/]+)\/.*');
        THIS.unreadCount.forEach(function(o) {
          if(rex1.test(o.id)) {
            THIS.feeds.push(o);
          } else {
            if(/reading-list/.test(o.id)) {
              GRStates.userid = o.id.replace(rex2, '$1');
            }
            THIS.userFeeds.push(o);
          }
        });
        if(!THIS.getuserid) {
          THIS.finishLoad(this.req);
        }
      }
    });
  },
  /**
   * @param {XMLHttpRequest} req HTTP request object
   */
  finishLoad: function(req) {
    var r = GRPrefs.getPref.sortByLabels() ? this.countLabeled() : this.onFeedsCounterLoad();
    var unr = r.counter;
    GRStates.currentNum = unr;
    if(unr === false) {
      GRW_StatusBar.setReaderTooltip('error');
      GRW_StatusBar.switchErrorIcon();
      GRW_StatusBar.hideCounter();
    } else if(unr > 0) {
      GRW_StatusBar.setReaderTooltip('new', unr);
      var grid, tt;
      mapWindows(function(win){
        tt = win.document.getElementById('GRW-statusbar-tooltip-new');
        tm = win.document.getElementById('GRW-statusbar-menu');
        while(tt.firstChild) {
          tt.removeChild(tt.firstChild);
        }
        grid = new win.GenStatusGrid(r.feeds);
        if(grid) tt.appendChild(grid.grid);
        var menu = new win.GenStatusMenu(win, r.feeds);
        menu.addItems();
      });
      GRW_StatusBar.switchOnIcon();
      GRW_StatusBar.showCounter(unr);
    } else {
      GRW_StatusBar.setReaderTooltip('nonew');
      GRW_StatusBar.switchOffIcon();
      var menu;
      mapWindows(function(win) {
        menu = new win.GenStatusMenu(win);
        menu.clearItems();
        menu.showHideSeparator(true);
      });
      if(GRPrefs.getPref.showZeroCounter() === false) {
        GRW_StatusBar.hideCounter();
      } else {
        GRW_StatusBar.showCounter(unr);
      }
      GRStates.showNotification = true;
    }
  },
  /**
   * @returns an object which contains the number of the unread feeds and an array which contains the feed objects
   * @type Obect
   */
  countLabeled: function() {
    var labeled = this.collectByLabels();
    var uc = this.feeds;
    var filteredLabels = GRPrefs.getPref.filteredLabels();
    var i, l, la, u, all = 0, feeds = new Array(), counted = new Object(), rex, label;
    var friendRex = new RegExp('^user/\\d+/state/com.google/broadcast-friends'), friendAdded = false;
    for(label in labeled) {
      rex = new RegExp('(?:^|,\\s*)' + GRW_escapeForRegExp(label) +'(?:$|,\\s*)', 'i');
      if(!rex.test(filteredLabels)) {
        labeled[label].count = 0;
        labeled[label].subs = new Array();
        uc.forEach(function(u) {
          if(friendRex.test(u.id) && label == '-') {
            feeds.push({Title: GRW_strings.getString('shareditems'), Id: u.id, Count: u.count});
            labeled[label].count += u.count;
            labeled[label].subs.push({Title: GRW_strings.getString('shareditems'), Id: u.id, Count: u.count, Shared: true});
            if(counted[u.id] !== true) {
              all += u.count;
              counted[u.id] = true;
            }
            friendAdded = true;
          } else {
            labeled[label].value.forEach(function(l) {
              if(u.id == l.id && u.count > 0) {
                labeled[label].count += u.count;
                labeled[label].subs.push({Title: l.title, Id: l.id, Count: u.count});
                if(counted[l.id] !== true) {
                  all += u.count;
                  counted[l.id] = true;
                }
              }
            });
          }
        });
        if(labeled[label].count > 0) {
          feeds.push({Title: label, Id: labeled[label].Id, Count: labeled[label].count, Subs: labeled[label].subs});
        }
      }
    }
    return {counter: all, feeds: feeds};
  },
  /**
   * Separate the feeds by labels
   * @returns an array with the feed objects which have labels, grouped by feeds
   * @type Object
   */
  collectByLabels: function() {
    var ob = this.subscriptionsList, labels = new Object(), o, u;
    var nolabel = {Id: '', value: new Array()};
    var rex = new RegExp('^(?:user/\\d+/state/com.google/broadcast-friends|feed)');
    ob.forEach(function(o) {
      if(rex.test(o.id)) {
        if(o.categories.length) {
          o.categories.forEach(function(u) {
            if(typeof labels[u.label] == 'undefined') {
              labels[u.label] = {
                value: new Array(),
                id: u.id
              }
            }
            labels[u.label].value.push(o);
          });
        } else {
          nolabel.value.push(o);
        }
      }
    });
    var a = new Array();
    for(label in labels) {
      a.push({name: label, value: labels[label].value, Id: labels[label].id});
    }
    a.sort(function(a,b) {
      return a.name > b.name;
    });
    var labels = new Object();
    a.forEach(function(o) {
      labels[o.name] ={value: o.value, Id: o.Id};
    });
    labels['-'] = {value: nolabel.value, Id: ''};
    return labels;
  },
  /**
   * @returns an object with the number of the unread feeds and the feedlist
   * @type {Object}
   */
  onFeedsCounterLoad: function() {
    var prc = this.feeds;
    var feeds = Array(), unr = this.feedsCounter(), o, u, filteredLabels = GRPrefs.getPref.filteredLabels();
    var friendRex = new RegExp('^user/\\d+/state/com.google/broadcast-friends');
    prc.forEach(function(u) {
      if(friendRex.test(u.id)) {
        feeds.push({Title: GRW_strings.getString('shareditems'), Id: u.id, Count: u.count});
      } else {
        unr.forEach(function(o) {
          o.filtered = false;
          o.categories.forEach(function(category) {
            var rex = new RegExp('(?:^|,\\s*)' + GRW_escapeForRegExp(category.label) +'(?:$|,\\s*)', 'i');
            if(rex.test(filteredLabels)) {
              o.filtered = true;
            }
          });
          if(o.id == u.id && u.count > 0 && !o.filtered) {
            feeds.push({Title: o.title, Id: o.id, Count: u.count})
          }
        });
      }
    });
    // filter the feeds, which aren't in the feedlist
    var outFeeds = Array(), counter = 0, THIS = this;
    feeds.forEach(function(o) {
      if(friendRex.test(o.Id)) { // put the friends feed into the list
        outFeeds.push(o);
        counter += o.Count;
      } else {
        THIS.FeedlistIds.forEach(function(u) {
          if(o.Id == u)  {
            counter += o.Count;
            outFeeds.push(o);
          }
        });
      }
    });
    return {counter: counter, feeds: outFeeds};
  },
  /**
  * @returns an array with the processed feeds object
  * @type {Array}
  */
  feedsCounter: function() {
    var data = this.subscriptionsList;
    var feeds = Array();
    data.forEach(function(d) {
      feeds.push({title: d.title, id:d.id, categories: d.categories});
    });
    return feeds;
  },
  /**
   * decode a json text
   * @param {String} text JSON string to decode
   * @return JavaScript object
   * @type {Object}
   */
  decodeJSON: function(text) {
    if(this.nativeJSON) {
      return this.nativeJSON.decode(text);
    } else {
      return eval('(' + text + ')');
    }
  }
};
