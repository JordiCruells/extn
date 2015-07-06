var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    AuthStrategy = require('./AuthStrategy').Strategy,
    oauth2 = require('./oauth2'),
    User = require('../models/user'),
    Client = require('../models/client'),
    AccessToken = require('../models/accessToken');

//TODO: we must refer to the user module, not the fakeUser
//var User = require('../models/user'),
//var User = require('../models/fakeUser');

var LOGIN_PATH = '/login';
var ACCOUNT_PATH = '/account';
var ADMIN = 'admin';
var ALL = '*';
var AUTHENTICATED = '@';

passport.serializeUser(function (user, done) {
    // TODO: use mongo database instead a fake database
    //done(null, user._id);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    // TODO: use mongo database instead a fake database
    User.findById(id, function (err, user) {
        if (err || !user) {
            return done(err, null);
        }
        done(null, user);
    });
    /*dbUsers.find(id, function (err, user) {
        done(err, user);
    });*/

});

module.exports = function (app, options) {

    var env = app.get('env'),
        config = options.providers;

    if (!options.successRedirect) {
        options.successRedirect = app.locals.site.baseUrl + ACCOUNT_PATH;
    }
    if (!options.failureRedirect) {
        options.failureRedirect = app.locals.site.baseUrl + LOGIN_PATH;
    }

    var readOrCreateUser = function(provider) {

        console.log('readOrCreateUser');

        return function (accessToken, refreshToken, profile, done) {

            console.log('profile: ' + JSON.stringify(profile));

            if (provider && provider != 'local') {

                var authId = provider + ':' + profile.id;
                User.findOne({authId: authId}, function (err, user) {
                    if (err) {
                        return done(err, null);
                    }
                    if (user) {
                        user.accessToken = accessToken;
                        user.refreshToken = refreshToken;
                    //   return done(null, user);
                    } else {
                        // If the user doesn't exist, create it
                        user = new User({
                            authId: authId,
                            displayName: profile.displayName,
                            accessToken: accessToken,
                            refreshToken: accessToken,
                            created: Date.now(),
                            role: 'customer'
                        });
                    }
                    user.save(function (err) {
                        if (err) {
                            console.log("err save user");
                            return done(err, null);
                        }
                        done(null, user);
                    });
                });
            } else {
                User.findById(profile.id, function (err, user) {
                    if (err) {
                        return done(err, null);
                    }
                    if (user) {
                        user.accessToken = accessToken;
                        user.refreshToken = refreshToken;
                        user.save(function (err) {
                            if (err) {
                                return done(err, null);
                            }
                            done(null, user);
                        });
                    } else {
                        // TODO: return an error ?
                        return done(null, false);
                    }
                });

            }
        };




    };

    return {
        init: function () {

           // configure Facebook strategy
            passport.use(new FacebookStrategy({
                clientID: config.facebook[env].appId,
                clientSecret: config.facebook[env].appSecret,
                //callbackURL: 'https://expressapp.local:443/auth/facebook/callback'
                callbackURL: config.facebook[env].callbackUrl
            }, readOrCreateUser('facebook')));


            passport.use(new GoogleStrategy({
                    clientID: config.google[env].appId,
                    clientSecret: config.google[env].appSecret,
                    callbackURL: config.google[env].callbackUrl
                }, readOrCreateUser('google')
            ));

            passport.use(new TwitterStrategy({
                    consumerKey:config.twitter[env].consumerKey,
                    consumerSecret: config.twitter[env].consumerSecret,
                    callbackURL: config.twitter[env].callbackUrl
                },
                readOrCreateUser('twitter')
            ));

            passport.use(new AuthStrategy({
                    // see https://github.com/jaredhanson/oauth2orize/blob/master/examples/all-grants/db/clients.js
                    clientID: config.oauth2[env].clientId,
                    clientSecret: config.oauth2[env].clientSecret,
                    callbackURL: config.oauth2[env].callbackUrl,
                    authorizationURL: config.oauth2[env].authorizationUrl,
                    tokenURL: config.oauth2[env].tokenUrl,
                    profileURL: config.oauth2[env].profileUrl,
                    baseSite: config.oauth2[env].baseSite
                }
                ,

                /*function (accessToken, refreshToken, profile, done) {
                    console.log('User.findOrCreate with profile : ' + JSON.stringify(profile) + ' acces token ' + accessToken);
                    //User.findOrCreate({ profile: profile }, function (err, user) {
                    //    user.accessToken = accessToken;
                        return done(null, {id: profile.id, name: profile.name});
                    //});
                }*/
                readOrCreateUser('local')
            ));

            /**
             * LocalStrategy
             *
             * This strategy is used to authenticate users based on a username and password.
             * Anytime a request is made to authorize an application, we must ensure that
             * a user is logged in before asking them to approve the request.
             */
            passport.use(new LocalStrategy(
                function(username, password, done) {
                    console.log('passport.use new LocalStrategy');

                    /*dbUsers.findByUsername(username, function(err, user) {
                        if (err) { return done(err); }
                        if (!user) { return done(null, false); }
                        if (user.password != password) { return done(null, false); }
                        console.log('returning user: ' + JSON.stringify(user) );
                        return done(null, user);
                    });*/

                    User.findOne({userName: username}, function(err, user) {
                        if (err) { return done(err); }
                        if (!user) { return done(null, false); }

                        // TODO: we must use password encryption
                        if (user.password != password) { return done(null, false); }

                        console.log('returning user: ' + JSON.stringify(user) );
                        return done(null, user);
                    });
                }
            ));

            /**
             * BasicStrategy & ClientPasswordStrategy
             *
             * These strategies are used to authenticate registered OAuth clients.  They are
             * employed to protect the `token` endpoint, which consumers use to obtain
             * access tokens.  The OAuth 2.0 specification suggests that clients use the
             * HTTP Basic scheme to authenticate.  Use of the client password strategy
             * allows clients to send the same credentials in the request body (as opposed
             * to the `Authorization` header).  While this approach is not recommended by
             * the specification, in practice it is quite common.
             */
            passport.use(new BasicStrategy(
                function(username, password, done) {

                    console.log('BasicStrategy');

                    Client.findByClientId(username, function(err, client) {
                        if (err) { return done(err); }
                        if (!client) { return done(null, false); }
                        if (client.clientSecret != password) { return done(null, false); }
                        return done(null, client);
                    });
                }
            ));

            passport.use(new ClientPasswordStrategy(
                function(clientId, clientSecret, done) {

                    console.log('ClientPasswordStrategy');
                    console.log('clientId: ' + clientId);
                    console.log('clientSecret: ' + clientSecret);

                    Client.findByClientId(clientId, function(err, client) {
                        console.log('findByClientId ');
                        if (err) { return done(err); }
                        if (!client) { return done(null, false); }
                        if (client.clientSecret != clientSecret) { return done(null, false); }
                        console.log('return client');
                        return done(null, client);
                    });
                }
            ));

            /**
             * BearerStrategy
             *
             * This strategy is used to authenticate either users or clients based on an access token
             * (aka a bearer token).  If a user, they must have previously authorized a client
             * application, which is issued an access token to make requests on behalf of
             * the authorizing user.
             */
            passport.use(new BearerStrategy(
                function(accessToken, done) {

                    console.log('BearerStrategy');

                    AccessToken.findById(accessToken, function(err, token) {
                        if (err) { return done(err); }
                        if (!token) { return done(null, false); }

                        if(token.userID != null) {

                            /*dbUsers.find(token.userID, function(err, user) {
                                if (err) { return done(err); }
                                if (!user) { return done(null, false); }
                                // to keep this example simple, restricted scopes are not implemented,
                                // and this is just for illustrative purposes
                                var info = { scope: '*' }
                                done(null, user, info);
                            });*/

                            User.findById(token.userID, function(err, user) {
                                if (err) { return done(err); }
                                if (!user) { return done(null, false); }

                                // TODO: check scopes
                                // to keep this example simple, restricted scopes are not implemented,
                                // and this is just for illustrative purposes
                                var info = {scope: '*'};

                                done(null, user, info);
                            });

                        } else {
                            //The request came from a client only since userID is null
                            //therefore the client is passed back instead of a user
                            Client.findByClientId(token.clientID, function(err, client) {
                                if(err) { return done(err); }
                                if(!client) { return done(null, false); }
                                // to keep this example simple, restricted scopes are not implemented,
                                // and this is just for illustrative purposes
                                var info = { scope: '*' }
                                done(null, client, info);
                            });
                        }
                    });
                }
            ));


            console.log("passport.initialize");
            app.use(passport.initialize());
            console.log("passport.session()");
            app.use(passport.session());
        },

        // PENDENT:
        //afegir parametre state a la url de redirecció, o sigui a la adreça de callback afegir un
        // paraemtre query state=....
        // veure: http://www.thread-safe.com/2014/05/the-correct-use-of-state-parameter-in.html
        //  o http://stackoverflow.com/questions/6463152/facebook-oauth-custom-callback-uri-parameters

        registerRoutes: function () {
            app.get('/auth/facebook', function (req, res, next) {
                passport.authenticate('facebook')(req, res, next);
            });
            app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: options.failureRedirect }), function (req, res) {
                var redirectTo = req.session.loginRedirect;
                delete req.session.loginRedirect;
                res.redirect(303, redirectTo || options.successRedirect || '/');
            });
            app.get('/auth/google', function (req, res, next) {
                passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'})(req, res, next);
            });
            app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: options.failureRedirect }), function (req, res) {
                var redirectTo = req.session.loginRedirect;
                delete req.session.loginRedirect;
                res.redirect(303, redirectTo || options.successRedirect || '/');
            });
            app.get('/auth/twitter',
                passport.authenticate('twitter')
            );
            app.get('/auth/twitter/callback',
                passport.authenticate('twitter', { failureRedirect: options.failureRedirect }),
                function(req, res) {
                    var redirectTo = req.session.loginRedirect;
                    delete req.session.loginRedirect;
                    res.redirect(303, redirectTo || options.successRedirect || '/');
                }
            );
            app.get('/auth/oauth',
                function (req, res, next) {
                    console.log('req.session: ' + JSON.stringify(req.session));
                    console.log('req.oauth2: ' + JSON.stringify(req.oauth2));
                    next();
                },
                passport.authenticate('oauth2-strategy')
            );
            app.get('/auth/oauth/callback',
                function (req, res, next) {
                    console.log('req.session: ' + JSON.stringify(req.session));
                    console.log('req.oauth2: ' + JSON.stringify(req.oauth2));
                    next();
                },

                // HACKING
                // I'm passing CSRF token to Auth otherwise it is giving a 401 Unathorized
                // when executing POST to /oauth/token
                // the file node_modules\passport-oauth\node_modules\passport-oauth2\lib\strategy.js
                // has been modified also

                //passport.authenticate('oauth2-strategy', { failureRedirect: options.failureRedirect }),
                passport.authenticate('oauth2-strategy', { failureRedirect: options.failureRedirect}),

                function(req, res) {
                    var redirectTo = req.session.loginRedirect;
                    delete req.session.loginRedirect;
                    res.redirect(303, redirectTo || options.successRedirect || '/');
                }
            );

            // Oauth2 server routes
            app.get(config.oauth2[env].authorizationUrl, oauth2.authorization);
            //app.post('/dialog/authorize/decision', oauth2.decision);
            app.post(config.oauth2[env].tokenUrl, oauth2.token);


            // User login routes
            app.get('/login', function (req, res) {
                res.render('_pages/login');
            });
            app.get('/auth/oauth/login', function (req, res) {
                res.render('_pages/oauth-login');
            });
            app.post('/auth/oauth/login',  passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/auth/oauth/login' }));
        },

        orize: function (paramRoles) {

            // improve this function in order to allow more expressive ways to declare
            // permissions. For example:
            // authorize('admin -login,public:* -test:@')
            // authorize('admin, customer -login,public:* -test:@')
            // authorize('@ -login:*')
            // authorize('-user.activated=1')


            return function (req, res, next) {

                // Check if the current request requires authentication

                console.log('AUTHORIZE PERMISSION');
                console.log('-------------------');
                console.log('path: ' + req.path);
                console.log('user: ' + JSON.stringify(req.user));

                if (req.path === LOGIN_PATH) return next();

                var role = (req.user) ? req.user.role : null,
                    roles;

                if (paramRoles != AUTHENTICATED && paramRoles != ALL) {
                    roles = paramRoles.trim().split(/\s*,\s*/).filter(function(el){ return el.length > 0;});
                }

                console.log('role: ' + role);
                console.log('paramRoles: ' + paramRoles);
                console.log('roles: ' + roles);

                if (paramRoles === ALL || (role && (role === ADMIN || paramRoles === AUTHENTICATED || role.indexOf(roles) >= 0 ))) {
                    return next();
                } else {
                    // Save the ull url in order to perform the redirection after succesful
                    // login to the same subdomain and with the same query parameters
                    // when it is the case
                    req.session.loginRedirect = 'https://' + req.get('host').match(/^(.*):\d+$/)[1] + req.originalUrl;
                    //req.session.loginRedirect = req.originalUrl;
                    console.log('loginRedirect is saved with ' + req.session.loginRedirect);
                    console.log(('session: ' + req.session));
                    return res.redirect(302, app.locals.site.baseUrl + LOGIN_PATH);
                    //return res.redirect(302, LOGIN_PATH);
                }


            };
        }
    };

};




