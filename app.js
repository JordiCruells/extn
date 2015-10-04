/*jslint node: true */
"use strict";

// Includes
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var nib = require('nib');
var jqupload = require('jquery-file-upload-middleware');
var credentials = require('./credentials.js');
var session = require('express-session');
var nodemailer = require('nodemailer');
// We can remove this because we will use email.js as proxy
var mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password
    }
});



//console.log('version: ' + express.version);

var vhost = require('vhost');
var Resource = require('express-resource');

// Database access
var mongoose = require('mongoose');
var Vacation = require('./models/vacation');
var VacationInSeasonListener = require('./models/vacationInSeasonListener');


// prevecnio d'atacs contra apis
var cors = require('cors');


// Publicacio de recursos estatics amb express-CDN
// Set the CDN options
/*var sslEnabled = false;
 var CDNoptions = {
 publicDir  : path.join(__dirname, 'public')
 , viewsDir   : path.join(__dirname, 'views')
 , domain     : 'cdn.your-domain.com'
 , bucket     : 'bucket-name'
 , endpoint   : 'bucket-name.s3.amazonaws.com' // optional
 , key        : 'amazon-s3-key'
 , secret     : 'amazon-s3-secret'
 , hostname   : 'localhost'
 , port       : (sslEnabled ? 443 : 1337)
 , ssl        : sslEnabled
 , production : true
 };*/

//i18n
var i18n = require('i18n');
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'iw'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: __dirname + '/locales',

    defaultLocale: 'en',
    // sets a custom cookie name to parseProfile locale settings from  - defaults to NULL
    cookie: 'lang'
});



//TODO: use redis for sesions
// Store sessions in mongo using session-mongoose
var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: dbConnectionString });

// To use strict routes in a friendly way
var slash   = require('express-slash');


// Own libs
var fortune = require('./lib/fortune.js');
var externalFiles = require('./lib/externalFiles.js');


// And here we go ....
var app = express();

// Initialize authentications (needs session)
var auth = require('./lib/auth.js')(app, {
    providers: credentials.authProviders ,
    successRedirect: '/account',
    failureRedirect: '/unathorized'
});

var registration = require('./lib/register')(app, {});

// Globals

// TODO : maybe move this configuration values to a JSON file (credentials ?)
var dbConnectionString = "",
    baseUrl = "",
    domain = "";

switch (app.get('env')) {
    case 'development':
        dbConnectionString = credentials.database.mongo.development.connectionString;
        baseUrl = "https://expressapp-local.com";
        domain = ".expressapp-local.com";
        break;
    case 'production':
        dbConnectionString = credentials.database.production.connectionString;
        baseUrl = "https://expressapp.com";
        domain = ".expressapp.com";
        break;
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}


// TODO: rewrite this to a config file
app.locals = {
    site: {
        title: 'Express App',
        description: 'A boilerplate for a simple web app using Node & Express',
        baseUrl: baseUrl
    },
    config: {
        externalFiles: externalFiles.list()
    },
    testing: {
        // If app is ran from a ...-test.js and we're not in production, then activate the crossPageTest flag
        crossPageTest: app.get('env') !== 'production' && /(-test\.js$)|(wwwTest$)/.test(module.parent.filename)
        //crossPageTest: true
    },
    auth: auth
};

// TODO: rewite this as a module static
// Translate static rsources to CDN paths
app.locals._st = function(name) {
    return require('./lib/static.js').map(name);
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = path.join(__dirname, 'views');
app.set('view engine', 'jade');

// Tell Express we are using a proxy and
// that it should be trusted
// ( comment or delete next line otherwise )
app.enable('trust-proxy');
app.set('strict routing', true);




// TODO: Move this to a JSOn file (same as above)
// Get connection to database
var DBOptions = {
    server: {
        socketOptions: {keepAlive: 1}
    }
};

// Connect to Mongo and execute preload once connected
mongoose.connect(dbConnectionString, DBOptions, require('./lib/databasePreload')(app));


// Service to send mails
var emailService = require('./lib/email.js')(credentials, app.get('env'));


app.use(express.static(path.join(__dirname, 'public')));



// uncomment after placing your favicon in /public|
//app.use(favicon(__dirname + '/public/favicon.ico'));

// Initialize the CDN magic

/*var expCDN = require('express-cdn');
 console.log('expCDN: ' + expCDN);
 var CDN = expCDN(app, CDNoptions);
 console.log('CDN: ' + CDN);
 app.locals.CDN = CDN();*/

// use cors only for routes matching /api...
app.use('/api', cors());

// use i18n
app.use(i18n.init);

// Css preprocessor
// This lines are commented because we will use grunt
// for compilng stylus files
/*console.log("src: " + path.join(__dirname, 'views'));
 console.log("dest: " + path.join(__dirname, 'public/stylesheets'));
 app.use(stylus.middleware({
 serve: false,
 src: path.join(__dirname),
 dest: path.join(__dirname, 'public'),
 compress: app.get('env') === 'production',
 compile : function(str, path) {
 console.log('compiling');
 console.log('path:' + path);
 var s = stylus(str)
 .set('filename', path)
 .set('warn', true)
 .set('compress', true)
 .use(nib())
 .import('nib');
 console.log(s);
 return s;
 },
 firebug: app.get('env') !== 'production',
 force: app.get('env') !== 'production'
 }));
 */




// Recover from errors using domains (should be first middleware to use)
app.use(require('./lib/recover')(app));

// Trace which working is handling the request
/*app.use(function (req, res, next) {
    var cluster = require('cluster');
    if (cluster.isWorker) {
        console.log('Worker %d received request', cluster.worker.id);
    }
    next();
});
*/

/*
app.use(function (req, res, next) {
    console.log("environment is " + app.get('env'));
    next();
});
*/

//Logging
switch (app.get('env')) {
    case 'development':
        app.use(morgan('dev'));
        break;
    case 'production':
        app.use(require('express-logger')({
            path: __dirname + '/log/requests.log'
        }));
        break;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Use a cookie secret to encode secure cookies
app.use(cookieParser(credentials.cookieSecret));

//Use sessions
//look at https://github.com/expressjs/session#options to get further information
app.use(session({
    cookie: {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: null,
        //domain: '.expressapp.local'
        domain: domain
    },
    proxy: undefined, // will use the "trust proxy" setting from express
    name: 'connect.sid',
    secret: credentials.cookieSecret,
    saveUninitialized: false,
    rolling: false,
    resave: false, //
    store: sessionStore, //ojo!!! hi ha millors alternatives que mongo per guradar sessions, pero per
                         // desenvolupmanet ja m'esta be (Redis, Dynamo,...)
    unset: 'keep',
    //domain: '.expressapp.local'
    domain: domain

})); // we can pass an object like {key: 'someKey', store: MemoryStore, cookie: {signed: true}}




// TODO : ensure thsi middleware it's necessary
// See http://stackoverflow.com/questions/9071969/using-express-and-node-how-to-maintain-a-session-across-subdomains-hostheaders
/*app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});*/
/// ----------------------------------------------------------------

/*
app.use(function (req, res, next) {
    console.log(('host: ' + req.host));
    console.log(('session: ' + req.session));
    console.log(('req.session.loginRedirect: ' + req.session.loginRedirect));
    next();
});
*/

console.log("auth init");
auth.init();


// TODO: move this route out of here
// UPload files with jquery file upload middleware
app.use('/upload', function (req, res, next) {

    // This route is for post data using multipart/form-data content type
    if (!require('type-is')(req, ['multipart/form-data'])) return next();

    var now = Date.now();
    jqupload.fileHandler({
        uploadDir: function () {
            return __dirname + '/public/uploads/' + now;
        },
        uploadUrl: function () {
            return '/uploads/' + now;
        }
    })(req, res, next);
});


// CSRF validation (some routes are excluded from this check)
// Exclude some routes fro requiring CSRF validations
app.use(
    [
        function(req,res,next) {
            if (['/oauth/token'].some(function(element, index, array) {
                    return element === req.path;
                })) {
                console.log('csurf middleware bypassed:');
                next();
            } else {
                console.log('csurf middleware passed:');
                require('csurf')()(req,res,next);
            }
        }
        ,
        function (req, res, next) {
            console.log('csrf set');
            // In case middleware csurf is not used req.csrfToken is be undefined
            if (req.csrfToken) {
                res.locals._csrfToken = req.csrfToken();
            }
           next();
        }
    ]
);

// Clear flash session if any and store it in locals
/*app.use(function (req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});*/
app.use(require('./lib/flash')());


//This function sets parameters that will be used to display tests on pages
if (app.get('env') !== 'production') {
    app.use(function (req, res, next) {
        res.locals.pageTest = req.query.test === '1';
        next();
    });
}


console.log("auth register routes");
auth.registerRoutes();
registration.registerRoutes();



/*
var attractionsApi = require('./routes/api.attractions');
app.use('/', attractionsApi);
*/


// Routes
var routes = require('./routes/index')(app);
var users = require('./routes/users')(app);
var admin = require('./routes/admin')(app);


// Use subdomain admin (perque funcioni s'ha de configurar dns o be en local
// modificar arxiu hosts perque arribin les peticions )
app.use(vhost('admin.*.com', admin));

var vacationPhoto = require('./routes/vacation-photo')(app);

app.use('/', routes);
app.use('/users', users);
app.use('/vacation-photo', vacationPhoto);
app.resource('forums', require('./routes/forums'));


app.use(slash());


/*console.log('module parent ' + module.parent.filename);
 console.log('test ' + /(.)+-test\.js$/.test(module.parent.filename));
 console.log('env ' + app.get('env'));
 console.log('crossPageTest ' + app.locals.testing.crossPageTest);
 */


//REMOVE FROM HERE AND PUT IN SOME ROUTES FILE !!!!

app.get('/account', auth.orize('@'), function (req, res) {
    res.send("account");
});

app.get('/unauthorized', function (req, res) {
    res.send("unauthorized");
});


app.get('/test-i18n', function(req, res) {
    console.log(res.__('Hello i18n'));
    res.send(res.__('Hello i18n'));
});

app.get('/csrf-form', function (req, res) {
    res.render('forms-examples/form-with-csrf');
});
app.post('/csrf-form', function (req, res) {
    res.send("aa");
});


app.get('/set-currency/:currency', function (req, res) {
    req.session.currency = req.params.currency;
    return res.redirect(303, '/vacations');
});

var convertFromUSD = function (value, currency ) {
    switch(currency) {
        case 'USD': return value * 1;
        case 'GPB': return value * 0.6;
        case 'BTC': return value * 0.00237079787643;
        default: return NaN;
    }
};


// Get data from database to populate view
app.get('/vacations', function (req, res) {
    Vacation.find({available: true}, function (err, vacations) {
        var currency = req.session.currency || 'USD';
        var context = {
            currency: currency,
            vacations: vacations.map(function (vacation) {
                return {
                    sku: vacation.sku,
                    name: vacation.name,
                    description: vacation.description,
                    price: convertFromUSD(vacation.getDisplayPrice(), currency),
                    inSeason: vacation.inSeason
                };
            })
        };

        switch (currency) {
            case 'USD': context.currencyUSD = 'selected'; break;
            case 'GBP': context.currencyGBP = 'selected'; break;
            case 'BTC': context.currencyBTC = 'selected'; break;
        }

        res.render('vacations/vacations', context);
    });
});

app.get('/vacations/notify-me-when-in-season', function (req, res) {
    res.render('vacations/notify-me-when-in-season', {sku: req.query.sku});
});

app.post('/vacations/notify-me-when-in-season', function (req, res) {
    VacationInSeasonListener.update(
        {email: req.body.email},
        {$push: {skus: req.body.sku}}, // Super-cool: it apends a new element in the skus array
        {upsert: true}, // if no element exists for the given conditions it will be inserted
        function (err) {
            if (err) {
                console.log(err.stack);
                console.log("set danger flash");
                req.session.flash = {
                    type: 'danger',
                    intro: 'Ooops',
                    message: 'There was an error processin your request.'
                };
                return res.redirect(303, '/vacations');
            }
            console.log("set success flash");
            req.session.flash = {
                type: 'success',
                intro: 'Thank you!',
                message: 'You will be notified when this vacation is in season'
            };
            return res.redirect(303, '/vacations');
        }
    );

});

// This url crashes the server (but using domains we can have a better control)
app.get('/epic-fail', function (req, res) {
    process.nextTick(function () {
        throw new Error('Kaboom!');
    });
});

// A nomral error that doesn't crash the srver
app.get('/fail', function (req, res) {
    throw new Error('Nope!');
});

app.get('/about', function (req, res) {
    res.render('about', {fortune: fortune.getFortune(), pageTestScript: "about.js", title: "About"});
});
app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate');
});
app.get('/markdown-example', function (req, res) {
    res.render('markdown-example');
});
app.get('/stylus-example', function (req, res) {
    res.render('stylus-example/stylus-example');
});
app.get('/newsletter', function (req, res) {
    res.render('forms-examples/newsletter', {csrf: 'CSRF token goes here'});
});
app.post('/process', function (req, res) {
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    if (req.xhr || req.accepts('json,html') === 'json') {
        res.send({success: true});
    } else {
        res.redirect(303, '/thank-you');
    }
});
app.get('/thank-you', function (req, res) {
    res.status(200).send("Thank-you");
});


app.get('/newsletterFlash', function (req, res) {
    res.render('forms-examples/newsletterFlash', {csrf: 'CSRF token goes here'});
});

app.post('/newsletterFlash', function (req, res) {

    // for now, we're mocking NewsletterSignup:
    function NewsletterSignup() {
    }

    NewsletterSignup.prototype.save = function (cb) {
        cb();
    };
    var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;


    var name = req.body.name || '',
        email = req.body.email || '';

    if (!email.match(VALID_EMAIL_REGEX)) {
        if (req.xhr) return res.json({error: 'Invalid name email address.'});
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email address you entered was not valid.'
        };
        return res.redirect(303, '/newsletterFlash');
    }

    new NewsletterSignup({name: name, email: email}).save(function (err) {

        if (err) {
            if (req.xhr) return res.json({error: 'Database error'});
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later'
            };
            return res.redirect(303, '/newsletterFlash');
        }

        if (req.xhr) return res.json({success: true});
        req.session.flash = {
            type: 'success',
            intro: 'Thank you!',
            message: 'You have now been signed up for the newsletter'
        };
        return res.redirect(303, '/newsletterFlash');

    });

});

app.get('/jquery-upload', function (req, res) {
    res.render('forms-examples/jquery-file-upload-example');
});

app.get('/setCookie', function (req, res) {
    res.status(200).cookie('monster', 'nom nom', {signed: true}).send("Cookie monster has been sent");
});

app.get('/setUsername', function (req, res) {
    req.session.userName = 'Jordi';
    res.status(200).send("Session username set to Jordi");
});

app.get('/getUsername', function (req, res) {
    res.status(200).send("Session username is : " + req.session.userName);
});


app.get('/sendMail', function (req, res) {

    console.log('Before sending mail');
    mailTransport.sendMail({
        from: "Express Test<info@expresstest_jcc.com>",
        to: 'jordi_cc@msn.com',
        subject: 'Prova de enviament de mail',
        text: 'Text de prova'
    }, function (err) {
        console.log('error ?');
        if (err) {
            console.log('Unable to send mail: ' + err);
            res.send("Unable to send mail");
        }
    });

    res.send("Mail sended");
});

app.get('/sendHtmlMail', function (req, res) {

    res.render('_emails/cart-thank-you', function (err, html) {
        if (err) console.log('error in mail template');
        mailTransport.sendMail({
            from: '"Meadowlark Travel": info@meadowlarktravel.com',
            to: 'jordi_cc@msn.com',
            subject: 'Thank you for Book your trip with Meadowlark',
            html: html,
            generateTextFromHtml: true
        }, function (err) {
            if (err) console.error('Unable to send confirmation: ' + err.stack);
        });
    });

    res.send("html mail sent");

});

app.post('/cart/checkout', function (req, res, next) {
    var VALID_EMAIL_REGEX = /joh.doe@gmail.com/;
    var cart = req.session.cart;
    if (!cart) next(new Error('Cart does not exist'));
    var name = req.body.name || '', email = req.body.email || '';
    if (!email.match(VALID_EMAIL_REGEX))
        return res.next(new Error('Invalid email address'));
    cart.number = Math.random().toString().replace(/^\.0*/, '');
    cart.billing = {
        name: name,
        email: email
    };
    res.render('_emails/cart-than-you', function (err, html) {
        if (err) console.log('error in mail template');
        mailTransport.sendMail({
            from: '"Meadowlark Travel": info@meadowlarktravel.com',
            to: cart.billing.email,
            subject: 'Thank you for Book your trip with Meadowlark',
            html: html,
            generateTextFromHtml: true
        }, function (err) {
            if (err) console.error('Unable to send confirmation: ' + err.stack);
        });
    });
});

//REMOVE FROM HERE !!!!


// Api's go after conventional routes
// Initialize apis
require('./lib/api').init(app);

// Load api's routes
require('./routes/api.attractions')(app);
require('./routes/api.users')(app);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    emailService.emailError("Page not found", req.route, err.status);
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        emailService.emailError("Server error: " + err.message + '\n' + err, 'Route:' + req.originalUrl, 'Stacktrace:' + err.stack);
        res.render('_pages/error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('_pages/error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;