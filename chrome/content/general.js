/**
 * @param {String} str String which special characters should be escaped
 */
var GRW_escapeForRegExp = function(str) {
  var specChars = new RegExp('([\\(\\)\\[\\]\\$\\^\\+\\*]+)', 'g');
  var strA = Array.prototype.slice.call(str);
  return strA.map(function(char){
    return char.replace(specChars, '\\$1');
  }).join('');
};
