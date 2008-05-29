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
      url: GRPrefs.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',
      successHandler: function(request) {
        THIS.subscriptionsList = eval('(' + this.req.responseText + ')').subscriptions;
        THIS.onFeedListLoad(this.req);
      }
    });
  },
  /**
   * @param {XMLHtpRequest} request ajax response object
   * @type {Array}
   */
  onFeedListLoad: function(request) {
    try {
      var data = eval('('+request.responseText+')').subscriptions;
    } catch(e) {
      return false;
    }
    var ids = Array();
    data.map(function(d) {
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
    new Ajax( {
      url: GRPrefs.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      successHandler: function() {
        var data = eval('('+this.req.responseText+')');
        THIS.unreadCount = data.unreadcounts;
        THIS.maxCount = GRW_StatusBar.maxCount = data.max;
        THIS.feeds = new Array();
        THIS.userFeeds = new Array();
        THIS.unreadCount.map(function(o) {
          if(/^feed/.test(o.id)) {
            THIS.feeds.push(o);
          } else {
            if(/reading-list/.test(o.id)) {
              var rex = new RegExp('^user\/([^/]+)\/.*');
              GRPrefs.userid = o.id.replace(rex, '$1');
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
    var r = GRPrefs.sortbylabels() ? this.countLabeled() : this.onFeedsCounterLoad();
    var unr = r.counter;
    GRPrefs.currentNum = unr;
    if(unr === false) {
      GRW_StatusBar.setReaderTooltip('error');
      GRW_StatusBar.switchErrorIcon();
      GRW_StatusBar.hideCounter();
    }
    else if(unr > 0) {
      GRW_StatusBar.setReaderTooltip('new', unr);
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      var enumerator = wm.getEnumerator('navigator:browser'), win, grid, tt;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        grid = new win.genStatusGrid(r.feeds);
        tt = win.document.getElementById('GRW-statusbar-tooltip-new');
        if(tt.firstChild) {
          tt.removeChild(tt.firstChild);
        }
        tt.appendChild(grid.grid);
      }
      GRW_StatusBar.switchOnIcon();
      GRW_StatusBar.showCounter(unr);
    }
    else {
      GRW_StatusBar.setReaderTooltip('nonew');
      GRW_StatusBar.switchOffIcon();
      if(GRPrefs.showzerocounter() === false) {
        GRW_StatusBar.hideCounter();
      }
      else {
        GRW_StatusBar.showCounter(unr);
      }
      GRPrefs.showNotification = true;
    }
  },
  /**
   * @returns an object which contains the number of the unread feeds and an array which contains the feed objects
   * @type Obect
   */
  countLabeled: function() {
    var labeled = this.collectByLabels();
    var uc = this.feeds;
    var i, l, la, u, all = 0, feeds = new Array(), counted = new Object();
    var filteredLabels = GRPrefs.filteredlabels();
    var rex;
    for(label in labeled) {
      rex = new RegExp('(?:^|,)' + label +'(?:$|,)', 'i');
      if(!rex.test(filteredLabels)) {
        labeled[label].count = 0;
        labeled[label].subs = new Array();
        labeled[label].map(function(l) {
          uc.map(function(u) {
            if(u.id == l.id && u.count > 0) {
              labeled[label].count += u.count;
              labeled[label].subs.push({Title: l.title, Id: l.id, Count: u.count});
              if(counted[l.id] !== true) {
                all += u.count;
                counted[l.id] = true;
              }
            }
          });
        });
        if(labeled[label].count > 0) {
          feeds.push({Title: label, Id: null, Count: labeled[label].count, Subs: labeled[label].subs});
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
    var nolabel = new Array();
    ob.map(function(o) {
      if(/^feed/.test(o.id)) {
        if(o.categories.length) {
          o.categories.map(function(u) {
            if(typeof labels[u.label] == 'undefined') {
              labels[u.label] = new Array();
            }
            labels[u.label].push(o);
          });
        } else {
          nolabel.push(o);
        } 
      }
    });
    var a = new Array();
    for(label in labels) {
      a.push({name: label, value: labels[label]});
    }
    a.sort(function(a,b) {
      return a.name > b.name;
    });
    var labels = new Object();
    a.map(function(o) {
      labels[o.name] = o.value;
    });
    labels['-'] = nolabel;
    return labels;
  },
  /**
   * @returns an object with the number of the unread feeds and the feedlist
   * @type {Object}
   */
  onFeedsCounterLoad: function() {
    var prc = this.feeds;
    var feeds = Array(), unr = this.feedsCounter(), o, u;
    unr.map(function(o) {
      prc.map(function(u) {
        if(o.id == u.id && u.count > 0) {
          feeds.push({Title: o.title, Id: o.id, Count: u.count})
        }
      });
    });
    // filter the feeds, which aren't in the feedlist
    var outFeeds = Array();
    var counter = 0;
    var THIS = this;
    feeds.map(function(o) {
      THIS.FeedlistIds.map(function(u) {
        if(o.Id == u)  {
          counter += o.Count;
          outFeeds.push(o);
        }
      });
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
    data.map(function(d) {
      feeds.push({title: d.title, id:d.id});
    });
    return feeds;
  }
};
