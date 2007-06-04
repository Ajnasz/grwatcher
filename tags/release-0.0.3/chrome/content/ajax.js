/**
 * @author ajnasz
 */

Function.prototype.bind = function()
{
  var __method = this, tmpargs = arguments, args = Array();
  for(var i = 0; i < tmpargs.length; i++)
  {
    args.push(tmpargs[i]);
  }
  var Args = args;
  var object = args.shift();
  return function() {
    return __method.apply(object, args.concat(Args));
  }
}
Ajax = {
  Request: function(options)
  {
    this.response = null;
    this.callback = options.callback ? options.callback : function() {};
    this.handleStateChange = function()
    {
      if(this.req.readyState == 4)
      {
        if(this.req.status == 200)
        {
          this.response = {error: false, text: this.req.responseText};
        }
        else
        {
          this.response = {error: this.status, text: this.req.statusText};
        }
        this.callback();
      }
    };
    alert(this.handleStateChange.bind(this));
    this.url = options.url;
    this.method = options.method ? options.method : 'get';
    this.parameters = options.parameters ? options.parameters : '';
    this.req = _req = new XMLHttpRequest();
    this.req.open(this.method, this.url, true);

    this.req.onreadystatechange = this.handleStateChange.bind(this);
    this.req.setRequestHeader('User-Agent','Google Reader Watcher 0.0.3b1 - Firefox Extension');
    this.req.setRequestHeader('Accept-Charset','utf-8');
    this.req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    if (this.method.toLowerCase() == 'post')
		{
			this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		}
    this.req.send(this.parameters);
  },
  handleStateChange: function(ajax)
  {
    if(ajax.readyState == 4)
    {
      if(ajax.status == 200)
      {
        return {error: false, text: ajax.responseText};
      }
      else
      {
        return {error: ajax.status, text: ajax.statusText};
      }
    }
  }
};
