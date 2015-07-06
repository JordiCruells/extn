var mongoose = require('mongoose');
var accessTokenSchema = mongoose.Schema(
    {
      _id: String,
      userID: String,
      clientID: String
    }
);

var AccessToken = mongoose.model('AccessToken', accessTokenSchema);
module.exports = AccessToken;

/*var tokens = {};

exports.find = function(key, done) {
  var token = tokens[key];
  return done(null, token);
};

exports.save = function(token, userID, clientID, done) {
  tokens[token] = { userID: userID, clientID: clientID };
  return done(null);
};*/
