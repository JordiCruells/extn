var passport = require('passport');
var User = require('../models/user'),
    passort = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    TwitterStrategy = require('passport-twitter').Strategy;

var LOGIN_PATH = '/login';
var ACCOUNT_PATH = '/account';
var ADMIN = 'admin';
var ALL = '*';
var AUTHENTICATED = '@';

passport.serializeUser(function (user, done) {
     done(null, user._id);
});

passport.deserializeUser(function (id, done) {

    User.findById(id, function (err, user) {
        if (err || !user) {
            return done(err, null);
        }
        done(null, user);
    });
});

module.exports = function (app, options) {
    if (!options.successRedirect) {
        options.successRedirect = app.locals.site.baseUrl + ACCOUNT_PATH;
    }
    if (!options.failureRedirect) {
        options.failureRedirect = app.locals.site.baseUrl + LOGIN_PATH;
    }

    var readOrCreateUser = function(provider) {
        return function (accessToken, refreshToken, profile, done) {
            var authId = provider + ':' + profile.id;
            User.findOne({authId: authId}, function (err, user) {
                if (err) {
                    return done(err, null);
                }
                if (user) {
                    return done(null, user);
                }
                // If the user doesn't exist, create it
                user = new User({
                    authId: authId,
                    name: profile.displayName,
                    created: Date.now(),
                    role: 'customer'
                });
                user.save(function (err) {
                    if (err) {
                        console.log("err save user");
                        return done(err, null);
                        done(null, user);
                    }
                });
            });
        };
    };

    return {
        init: function () {
            var env = app.get('env');
            var config = options.providers;

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

                console.log('ATHORIZE PERMISSION');
                console.log('-------------------');
                console.log('path: ' + req.path);

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




