/**
 * This class will retreive, process, sort the user feeds
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
    }
    catch(e) {
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
        THIS.unreadCount = eval('('+this.req.responseText+')').unreadcounts;
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
      var enumerator = wm.getEnumerator('navigator:browser'), win;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        win.genStatusGrid(r.feeds);
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
    var i, l, la, u, all = 0, feeds = Array();
    for(label in labeled) {
      labeled[label].count = 0;
      labeled[label].map(function(l) {
        uc.map(function(u) {
          if(u.id == l.id) {
            labeled[label].count += u.count;
          }
        });
      });
      if(labeled[label].count > 0) {
        feeds.push({Title: label, Id: null, Count: labeled[label].count});
      }
    }
    uc.map(function(u) {
      if(/^feed/.test(u.id)) {
        all += u.count;
      }
    });
    return {counter: all, feeds: feeds};
  },
  /**
   * Separate the feeds by labels
   * @returns an array with the feed objects which have labels, grouped by feeds
   * @type Object
   */
  collectByLabels: function() {
    var ob = this.subscriptionsList, labels = new Object(), o, u;
    labels.nolabel = new Array();
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
          labels.nolabel.push(o);
        } 
      }
    });
    if(labels.nolabel.length == 0) {
      delete labels.nolabel;
    }
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
