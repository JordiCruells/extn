
var clients = require('../credentials').clients;

/*var clients = [
    { id: '1', name: 'Web-Client', clientId: 'web', clientSecret: 'ssh-secret' },
    { id: '2', name: 'Mobile-Client', clientId: 'mobile', clientSecret: 'ssh-password' }
];*/


exports.find = function(id, done) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.id === id) {
      return done(null, client);
    }
  }
  return done(null, null);
};

exports.findByClientId = function(clientId, done) {
  for (var i = 0, len = clients.length; i < len; i++) {
    var client = clients[i];
    if (client.clientId === clientId) {
      console.log('findByClientId: ' + JSON.stringify(client));
      return done(null, client);
    }
  }
  return done(null, null);
};
