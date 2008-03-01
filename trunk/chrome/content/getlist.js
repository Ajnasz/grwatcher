var GetList = function() {
  this.getFeedList();
}
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
        // getReadFeedsCounter(this.req);
        THIS.FinishLoad(this.req);
      }
    });
  },
  FinishLoad: function(req) {
    var r = GRPrefs.sortbylabels() ? this.countLabeled(this.collectByLabels(this.subscriptionsList), this.onunreadCountAjax.req) : this.onFeedsCounterLoad(this.subscriptionsList, this.onunreadCountAjax.req);
    var unr = r.counter;
    GRPrefs.currentNum = unr;
    if(unr === false) {
      setReaderTooltip('error');
      GRCheck.switchErrorIcon();
      hideCounter();
    }
    else if(unr > 0) {
      setReaderTooltip('new', unr);
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
      var enumerator = wm.getEnumerator('navigator:browser'), win;
      while(enumerator.hasMoreElements()) {
        win = enumerator.getNext();
        win.genStatusGrid(r.feeds);
      }
      GRCheck.switchOnIcon();
      showCounter(unr);
    }
    else {
      setReaderTooltip('nonew');
      GRCheck.switchOffIcon();
      if(GRPrefs.showzerocounter() === false) {
        hideCounter();
      }
      else {
        showCounter(unr);
      }
      GRPrefs.showNotification = true;
    }
  },
  countLabeled: function(labeled, prReq) {
    var prc = eval('('+prReq.responseText+')');
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
  collectByLabels: function(ob) {
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
 *
 * @param {Object} req FeedsCounter request object
 * @param {Object} prReq Counter request object
 * @type {Object}
 */
  onFeedsCounterLoad: function(req, prReq) {
    if(prReq != false) {
      try {
        var prc = eval('('+prReq.responseText+')');
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
    var unr = feedsCounter(req);
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
}
