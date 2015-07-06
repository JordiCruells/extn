var mongoose = require('mongoose');
var authorizationCodeSchema = mongoose.Schema(
    {
      _id: String,
      clientID: String,
      redirectURI: String,
      userID: String
    }
);

var AuthorizationCode = mongoose.model('AuthorizationCode', authorizationCodeSchema);
module.exports = AuthorizationCode;







/*var codes = {};

exports.find = function(key, done) {
  var code = codes[key];
  return done(null, code);
};

exports.save = function(code, clientID, redirectURI, userID, done) {
  codes[code] = { clientID: clientID, redirectURI: redirectURI, userID: userID };
  return done(null);
};*/
