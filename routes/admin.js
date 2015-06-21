var express = require('express');



// ADVICE: THIS WON'T WORK AS
// admin router is using a subdomain and
// the authentication process only works
// with the rrot domain

// (s'ahauria de registrar i configuara passport per
// el subdomini i crea nova plicacio facebook per
// configurar les urls de retorn pel subdomini)


module.exports = function(app) {

    var authorize = app.locals.auth.orize;

    var router = express.Router({
        caseSensitive : app.get('case sensitive routing'),
        strict: app.get('strict routing')
    });

    //router.use(authorize('admin -login,public:* -test:@'));
    router.use(authorize('@'));

    router.get('/', function(req, res) {

        console.log('admin/');
        res.send('admin');
    });

    router.get('/users', function(req, res) {
        res.send('admin/users');
    });

    router.get('/login', function (req, res) {
        res.render('_pages/login');
    });



    return router;
}
