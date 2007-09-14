/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @license GPL v2
 */
/**
 * @author Koszti Lajos [Ajnasz] http://ajnasz.hu ajnasz@ajnasz.hu 
 * @param {Object} pars
 */
var Ajax = function(pars)
{
  if(typeof pars.url == 'undefined')
  {
    return false;
  }

  var stChg = function(ob, p)
  {
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
  this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

  this.req.onreadystatechange = stChg(this, false);
  this.req.send(this.pars); 
};
Ajax.prototype =
{
  url: null,
  pars: null,
  req: null,
  method: 'get',
  agent: 'Google Reader Watcher 0.0.8.1',
  handler: function(pars)
  {
    try
    {
      if (this.req.readyState == 4)
      {
        if(this.req.status != 'undefined')
        {
          if(this.req.status == 200)
          {
            return this.successHandler();
          }
          else
          {
            return this.errorHandler();
          }
        }
        else
        {
          return this.errorHandler();
        }
      }
      else
      {
        return this.loadHandler();
      }
    }
    catch(e)
    {
      return this.errorHandler();
    }
  },
  successHandler: function()
  {
    return this.req.responseText;
  },
  errorHandler: function()
  {
    GRCheck.switchErrorIcon();
    hideCounter();
    return false;
  },
  loadHandler: function()
  {
    GRCheck.switchLoadIcon();
    return true;
  }
};
