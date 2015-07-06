/**
 * Module dependencies.
 */
var oauth2orize = require('oauth2orize')
  , passport = require('passport')
  , login = require('connect-ensure-login')
  , utils = require('./utils')
    , Client = require('../models/client')
    , AuthorizationCode = require('../models/authorizationCode')
    , AccessToken = require('../models/accessToken')
    , User = require('../models/user')
    , server = oauth2orize.createServer(); //OAuth2 server

console.log('server created');

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function(client, done) {
    console.log('server.serializeClient: ' + JSON.stringify(client));
    return done(null, client.id);
});

server.deserializeClient(function(id, done) {
    console.log('server.deserializeClient: ' + id);

  Client.find(id, function(err, client) {
    if (err) { return done(err); }
      console.log('client: ' + JSON.stringify(client));
    return done(null, client);
  });
});

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.

server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {

    console.log('server.grant(oauth2orize.grant.code');
    console.log('client: ' + client);
    console.log('redirectURI: ' + redirectURI);
    console.log('user: ' + user);
    console.log('ares: ' + ares);

    var code = utils.uid(16)

    /*dbAuthorizationCodes.save(code, client.id, redirectURI, user.id, function(err) {
        if (err) { return done(err); }
        console.log('authorization code is: ' + code);
        done(null, code);
    });*/

    new AuthorizationCode({
        _id: code,
        clientID: client.id,
        redirectURI: redirectURI,
        userID: user.id
    }).save(function (err) {
            // TODO: check it is not a duplicate code error
            if (err) { return done(err); }
            console.log('authorization code is: ' + code);
            done(null, code);
        });
}));

// Grant implicit authorization.  The callback takes the `client` requesting
// authorization, the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a token, which is bound to these
// values.

server.grant(oauth2orize.grant.token(function(client, user, ares, done) {

    console.log('server.grant(oauth2orize.grant.token');
    console.log('client: ' + client);
    console.log('user: ' + user);
    console.log('ares: ' + ares);
    var token = utils.uid(256);


    new AccessToken({
        _id: token,
        userID: user.id,
        clientID: client.clientId
    }).save(function (err) {
            if (err) {
                return done(err);
            }
            console.log('access token is: ' + token);
            done(null, token);
        }
    );

    /*dbAccessTokens.save(token, user.id, client.clientId, function(err) {
        if (err) { return done(err); }
        console.log('access token is: ' + token);
        done(null, token);
    });*/

}));

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {

    console.log('server.exchange(oauth2orize.exchange.code');

    console.log('client: ' + client);
    console.log('code: ' + code);
    console.log('redirectURI: ' + redirectURI);

   //dbAuthorizationCodes.find(code, function(err, authCode) {

    AuthorizationCode.findById(code, function (err, authCode) {

        if (err) { return done(err); }
        if (client.id !== authCode.clientID) { return done(null, false); }
        if (redirectURI !== authCode.redirectURI) { return done(null, false); }

        var token = utils.uid(256)

        /*dbAccessTokens.save(token, authCode.userID, authCode.clientID, function(err) {
          if (err) { return done(err); }
          done(null, token);
        });
        */
        new AccessToken({
            _id: token,
            userID: authCode.userID,
            clientID: authCode.clientID
        }).save(function (err) {
                if (err) { // TODO: check its not a duplicate token error
                    return done(err);
                }
                console.log('access token is: ' + token);
                done(null, token);
            }
        );

  });
}));

// Exchange user id and password for access tokens.  The callback accepts the
// `client`, which is exchanging the user's name and password from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the user who authorized the code.

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {

    console.log('server.exchange(oauth2orize.exchange.password');

    console.log('client: ' + client);
    console.log('username: ' + username);
    console.log('password: ' + password);
    console.log('sccope: ' + scope);

    //Validate the client
    Client.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        //Validate the user
        /*dbUsers.findByUsername(username, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }
            if(password !== user.password) {
                return done(null, false);
            }
            //Everything validated, return the token
            var token = utils.uid(256);
            dbAccessTokens.save(token, user.id, client.clientId, function(err) {
                if (err) { return done(err); }
                done(null, token);
            });
        }); */

        User.findOne({userName: username}, function(err, user) {
            if (err) { return done(err); }
            if(user === null) {
                return done(null, false);
            }

            // TODO: use password encrpyption
            if(password !== user.password) {
                return done(null, false);
            }
            //Everything validated, return the token
            var token = utils.uid(256);

            /*dbAccessTokens.save(token, user.id, client.clientId, function(err) {
                if (err) { return done(err); }
                done(null, token);
            });*/

            new AccessToken({
                _id: token,
                userID: user.id,
                clientID: client.clientID
            }).save(function (err) {
                    if (err) {
                        return done(err);
                    }
                    console.log('access token is: ' + token);
                    done(null, token);
                }
            );


        });
    });
}));

// Exchange the client id and password/secret for an access token.  The callback accepts the
// `client`, which is exchanging the client's id and password/secret from the
// authorization request for verification. If these values are validated, the
// application issues an access token on behalf of the client who authorized the code.

server.exchange(oauth2orize.exchange.clientCredentials(function(client, scope, done) {

    console.log('server.exchange(oauth2orize.exchange.clientCredentials');
    console.log('client: ' + client);
    console.log('sccope: ' + scope);

    //Validate the client
    Client.findByClientId(client.clientId, function(err, localClient) {
        if (err) { return done(err); }
        if(localClient === null) {
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret) {
            return done(null, false);
        }
        var token = utils.uid(256);
        //Pass in a null for user id since there is no user with this grant type

        /*dbAccessTokens.save(token, null, client.clientId, function(err) {
            if (err) { return done(err); }
            done(null, token);
        });*/

        new AccessToken({
            _id: token,
            userID: null,
            clientID: client.clientID
        }).save(function (err) {
                if (err) {
                    return done(err);
                }
                console.log('access token is: ' + token);
                done(null, token);
            }
        );

    });
}));

// user authorization endpoint
//
// `authorization` middleware accepts a `validate` callback which is
// responsible for validating the client making the authorization request.  In
// doing so, is recommended that the `redirectURI` be checked against a
// registered value, although security requirements may vary accross
// implementations.  Once validated, the `done` callback must be invoked with
// a `client` instance, as well as the `redirectURI` to which the user will be
// redirected after an authorization decision is obtained.
//
// This middleware simply initializes a new authorization transaction.  It is
// the application's responsibility to authenticate the user and render a dialog
// to obtain their approval (displaying details about the client requesting
// authorization).  We accomplish that here by routing through `ensureLoggedIn()`
// first, and rendering the `dialog` view. 

exports.authorization = [

  function(req,res,next) {
    console.log('exports.authorization');
    console.log('req.scope: ' + req.scope);
    next();
  },

  login.ensureLoggedIn('/auth/oauth/login'),


  server.authorization(function(clientID, redirectURI, done) {

      console.log('server.authorization');
      console.log('clientID: ' + clientID);
      console.log('redirectURI: ' + redirectURI);

      Client.findByClientId(clientID, function(err, client) {
          if (err) { return done(err); }
          if (!client) { return done(null, false); }

          // TODO: check redirectURI before done
          // WARNING: For security purposes, it is highly advisable to check that
          //          redirectURI provided by the client matches one registered with
          //          the server.  For simplicity, this example does not.  You have
          //          been warned.


          //console.log('transactionID: ' + req.oauth2.transactionID);
          //console.log('req.oauth2: ' + JSON.stringify(req.oauth2));
          console.log('client: ' + JSON.stringify(client));
          console.log('redirectURI: ' + redirectURI);
          console.log('done(null, client, redirectURI): ' + done);

          return done(null, client, redirectURI);
      });
  })


    // OJO!!
  // Si volem saltar-nos el dialeg de autoritzacio, comentem el seguen bloc
  // i afegim server.decision que cridi a done

  /*,function(req, res){
      console.log('res.render(dialog');
      console.log('transactionID: ' + req.oauth2.transactionID);
      console.log('user: ' + req.user);
      console.log('client: ' + req.oauth2.client);
      res.render('dialog', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
  }*/

   // Setting loadTransaction to false causes transactionLoader not to be invoked when decision is invoked
   // and avoiding the error: 'Missing required parameter: transaction_id'. In this case, there's no  need to
    // load the transaction cause we are in the same request.

  ,server.decision({loadTransaction: false},
        function(req, done) {
           console.log('server.decision');
            return done(null,{ scope: req.scope || 'all'
        });
  })



    /*, server.decision(function(req, done) {
            console.log('server.decision');
            req
            //return done(null, { scope: req.scope || 'all' });
            return done(null,{ scope: req.scope || 'all' });

        })
        */
]

// user decision endpoint
//
// `decision` middleware processes a user's decision to allow or deny access
// requested by a client application.  Based on the grant type requested by the
// client, the above grant middleware configured above will be invoked to send
// a response.

exports.decision = [
  login.ensureLoggedIn(),
  server.decision()
]


// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [


   /* function (req, res) {
        res.json({user: req.user});
    },
*/
    function (req, res, next) {
        console.log('ttokken before passport authenitcate');
        next();
    },
    passport.authenticate(['basic', 'oauth2-client-password'], {session: false}),

    function (req, res, next) {
        console.log('ttokken before token');
        next();
    },

    server.token(),

    function (req, res, next) {
        console.log('ttokken before error handler');
        next();
    },

    server.errorHandler()
];
