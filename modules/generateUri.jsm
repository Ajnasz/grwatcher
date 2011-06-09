var uriRex_ = new RegExp('^https?://');
/**
  * @method uri
  * @description Creates urls
  * @param {String} domain the domain name of the url
  *  Other arguments are optional, but if it's a string then it will be added
  *  to the domain with a / or if it's an object, it's key value pairs will be
  *  used as a query parameter
  *  if its a boolean it will mean that the uri should be extended with client
  *  and ck params or not
  */
var generateUri = function(domain) {
    let args =[].slice.call(arguments),
        uriRoot = args.shift(),
        uriParts = [],
        queryParams = [],
        connectionType = Components.
          classes["@mozilla.org/preferences-service;1"].
          getService(Components.interfaces.nsIPrefBranch).
          getBoolPref('extensions.grwatcher.usesecureconnection') ? 'https' : 'http',
        output = '',
        shouldExtend = true;

    while(args.length) {
      let part = args.shift();
      let type = typeof part;
      if(type == 'string') {
          uriParts.push(part);
      } else if(type == 'boolean') {
        shouldExtend = part;
        break;
      } else {
          for(let i in part) {
              if(part.hasOwnProperty(i)) {
                  queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(part[i]));
              }
          }
          break;
      }
    }
    output = uriRoot;
    if(uriParts.length > 0) {
        output += '/' + uriParts.join('/');
    }
    if(shouldExtend) {
      queryParams.push('client=grwatcher&ck=' + new Date().getTime());
    }
    if(queryParams.length > 0) {
        output += '?' + queryParams.join('&');
    }
    if(uriRex_.test(output)) {
        output = output.replace(uriRex, '');
    }
    output = connectionType + '://' +  output;
    return output;
};

let EXPORTED_SYMBOLS = ['generateUri'];
