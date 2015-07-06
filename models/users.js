// TODO: use mongo database instead of fake database

var users = [
    { id: '1', username: 'bob', password: 'secret', name: 'Bob Smith', role: 'admin' },
    { id: '2', username: 'joe', password: 'password', name: 'Joe Davis', role: 'user' }
];


exports.find = function(id, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.id === id) {
      return done(null, user);
    }
  }
  return done(null, null);
};

exports.findByUsername = function(username, done) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return done(null, user);
    }
  }
  return done(null, null);
};
