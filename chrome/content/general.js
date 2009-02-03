/**
 * escaping the special regexp characters, so we won't get an error when try to create a regexp like this: var a = ':)';new RegExp(a);
 * @param {String} str String which special characters should be escaped
 * @returns the escaped string
 * @type String
 */
var GRW_escapeForRegExp = function(str) {
  var specChars = new RegExp('([\\(\\)\\[\\]\\$\\^\\+\\*]+)', 'g');
  var strA = Array.prototype.slice.call(str);
  return strA.map(function(char){
    return char.replace(specChars, '\\$1');
  }).join('');
};
