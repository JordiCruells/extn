/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};





// Removes leading and trailing spaces from a string
exports.trim = function (s) {
  return s.replace(/^\s+|\s+$/g,'');
};


// Returns the string with capitalized words
exports.capitalize = function (s) {

  var st = exports.trim(s);
  if (!st) return '';

  var join = /[\s\-]+/g;
  var words = st.split(join).map(function (w) {
    var w0 = w.charAt(0).toUpperCase();
    return (w.length > 1) ? (w0 + (w.slice(1)).toLowerCase()) : w0;
  });
  var joins = st.match(join) || [];
  var i = 0,
      returnString = '';

  for (i; i<words.length; i++) {
    returnString += words[i] + ( joins[i] || '');
  }
 return returnString;
};


/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
