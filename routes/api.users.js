// TODO: implement this function, now it's only faking a return

//Restful api
module.exports = function (app) {

    var passport = require('passport');

    /*var rest = require('connect-rest');
    var apiOptions = require('../lib/api').apiOptions;
    var vhost = require('vhost');

    //var User = ???;

    rest.get('/profile', function (req, content, callback) {

            callback(null,
                {
                    id: 5,
                    name: 'jordi'
                });
    });*/

    app.use('/profile',

     [
     passport.authenticate('bearer', { session: false }),

     function(req, res) {
     // req.authInfo is set using the `info` argument supplied by
     // `BearerStrategy`.  It is typically used to indicate scope of the token,
     // and used in access control checks.  For illustrative purposes, this
     // example simply returns the scope in the response.

         console.log('app use /profile -> req ' + req);
         console.log('app use /profile -> session ' + JSON.stringify(req.session));
         res.json({
             user_id: req.user.id, name: req.user.name

             // TODO: veure si cal tornar scope
             //, scope: req.authInfo.scope
         });
     }]
    );

    //app.use(vhost('api.*.com', rest.rester(apiOptions)));
};
