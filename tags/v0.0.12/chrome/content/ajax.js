/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu
 * @license GPL v2
 */
/**
 * @param {Object} pars
 */
var Ajax = function(pars, parameters) {
  if(typeof pars.url == 'undefined') {
    return false;
  }

  var stChg = function(ob, p) {
    return function() { ob.handler(p); }
  }

  this.url = pars.url;
  this.pars = typeof pars.pars != 'undefined' ? pars.pars : this.pars;
  this.handler = typeof pars.handler != 'undefined' ? pars.handler : this.handler;
  this.method = typeof pars.method != 'undefined' ? pars.method : 'get';
  this.successHandler = typeof pars.successHandler != 'undefined' ? pars.successHandler : this.successHandler;

  this.req = new XMLHttpRequest();
  this.req.open(this.method, this.url, true);
  this.req.setRequestHeader('User-Agent', this.agent);
  this.req.setRequestHeader('Accept-Charset','utf-8');
  this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  if(this.method == 'post') {
    this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  }
  this.parameters = typeof parameters != 'undefined' ? parameters : null;
  this.req.onreadystatechange = stChg(this, false);
  this.req.send(this.parameters);
};
Ajax.prototype = {
  url: null,
  pars: null,
  req: null,
  method: 'get',
  agent: 'Google Reader Watcher 0.0.12',
  handler: function(pars) {
    try {
      if(this.req.readyState == 4) {
        if(typeof this.req.status != 'undefined') {
          if(this.req.status == 200) {
            return this.successHandler(this.req);
          }
          else {
            return this.errorHandler('status code - ' + this.req.status);
          }
        }
        else {
          return this.errorHandler('no status code');
        }
      }
      else {
        return this.loadHandler();
      }
    } catch(e) {
      return this.errorHandler('no readyState', e);
    }
  },
  successHandler: function() {
    return this.req.responseText;
  },
  errorHandler: function(msg, er) {
    GRW_StatusBar.switchErrorIcon();
    GRW_StatusBar.hideCounter();
    GRW_LOG('Ajax error: ' + msg + ' || ' + er.message + ' - ' + er.line);
    GRW_LOG(this.url);
    return false;
  },
  loadHandler: function() {
    GRW_StatusBar.switchLoadIcon();
    return true;
  }
};