var GetList = function() {
  this.getFeedList();
};
GetList.prototype = {
  getFeedList: function() {
    var THIS = this;
    new Ajax({
      url: GRPrefs.conntype + '://www.google.com/reader/api/0/subscription/list?output=json',
      successHandler: function(request) {
        THIS.subscriptionsList = this.req.responseText;
        THIS.onFeedListLoad(this.req);
      }
    });
  },
/**
 * @param {Object} req ajax response object
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
    for(var i = 0; i < data.length; i++) {
      ids.push(data[i].id);
    }
    FeedlistIds = ids;
    this.getReadCounter();
    return ids;
  },
/**
 * request for unreaded feeds
 */
  getReadCounter: function() {
    var THIS = this;
    this.onunreadCountAjax = new Ajax( {
      url: GRPrefs.conntype + '://www.google.com/reader/api/0/unread-count?all=true&output=json',
      successHandler: function() {
        THIS.finishLoad(this.req);
      }
    });
  },
  /**
   *
   */
  finishLoad: function(req) {
    var r = GRPrefs.sortbylabels() ? this.countLabeled() : this.onFeedsCounterLoad();
    var unr = r.counter;
    GRPrefs.currentNum = unr;
    if(unr === false) {
      GRW_StatusBar.setReaderTooltip('error');
      GRCheck.switchErrorIcon();
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
      GRCheck.switchOnIcon();
      GRW_StatusBar.showCounter(unr);
    }
    else {
      GRW_StatusBar.setReaderTooltip('nonew');
      GRCheck.switchOffIcon();
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
   * 
   */
  countLabeled: function() {
    var labeled = this.collectByLabels();
    var prc = eval('('+this.onunreadCountAjax.req.responseText+')');
    uc = prc.unreadcounts;
    var i, l, all = 0, out = Array();
    for(label in labeled) {
      labeled[label].count = 0;
      l = labeled[label];
      for(var j = 0; j < l.length; j++) {
        for(var i = 0; i < uc.length; i++) {
            if(uc[i].id == l[j].id) {
              labeled[label].count += uc[i].count;
              all += uc[i].count;
            }
        }
      }
      if(labeled[label].count > 0) {
        out.push({Title: label, Id: null, Count: labeled[label].count});
      }
    }
    return {counter: all, feeds: out};
  },
  /**
   * Separate the feeds by labels
   * @returns an array with the feed objects which have labels, grouped by feeds
   * @type Object
   */
  collectByLabels: function() {
    try {
      var ob = eval('('+this.subscriptionsList+')').subscriptions;
    }
    catch(e) {
      return false;
    }
    var labels = new Object();
    labels.nolabel = new Array();
    for(var i = 0; i < ob.length; i++) {
      if(ob[i].categories.length) {
        for(var j = 0; j < ob[i].categories.length; j++) {
          if(typeof labels[ob[i].categories[j].label] == 'undefined') {
            labels[ob[i].categories[j].label] = new Array();
          }
          labels[ob[i].categories[j].label].push(ob[i]);
        }
      }
      else {
        labels.nolabel.push(ob[i]);
      }
    }
    return labels;
  },
  /**
   * @returns an object with the number of the unread feeds and the feedlist
   * @type {Object}
   */
  onFeedsCounterLoad: function() {
    if(this.onunreadCountAjax.req != false) {
      try {
        var prc = eval('('+this.onunreadCountAjax.req.responseText+')');
        prc = prc.unreadcounts;
      }
      catch (e) {
        var prc = false;
      }
    }
    else {
      var prc = false;
    }
    var feeds = Array();
    var unr = feedsCounter(this.subscriptionsList);
    for(var i = 0; i < unr.length; i++) {
      for(var j = 0; j < prc.length; j++) {
        if(unr[i].id == prc[j].id && prc[j].count > 0) {
          feeds.push({Title: unr[i].title, Id: unr[i].id, Count: prc[j].count})
        }
      }
    }
    // filter the feeds, which aren't in the feedlist
    var outFeeds = Array(), rex;
    var counter = 0;
    for(var i = 0; i < feeds.length; i++) {
      for(var j = 0; j < FeedlistIds.length; j++) {
        rex = new RegExp('^'+FeedlistIds[j]);
        if(FeedlistIds[j] == feeds[i].Id) {
          counter += feeds[i].Count;
          outFeeds.push(feeds[i]);
        }
      }
    }
    return {counter: counter, feeds: outFeeds};
  }
};
