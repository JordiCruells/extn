
var bcrypt = require('bcrypt'),
    hasOwn = Object.hasOwnProperty;
    utils = require('../lib/utils'),
    formMod = require('../lib/form'),
    User = require('../models/user'),
    mail = require('../lib/mail'),
    validator = require('./validator'),
    password = require('./password'),
    config = require('../credentials');

var trim = utils.trim,
    capitalize = utils.capitalize,
    uid = utils.uid;

var registrationFields = ['firstName', 'lastName', 'email', 'password', 'password_repeat'],
    activationMail = {subject: 'Account activation', template: '_emails/activate_account_mail'},
    welcomeMail = {subject: 'Welcome to ExpressApp', template: '_emails/welcome_mail'}; //TODO: welcome to expressApp subsitute expressApp by configuration title

var REGISTER_PATH = config.routes.REGISTER,
    ACTIVATE_PATH = config.routes.ACTIVATE,
    LOGIN_PATH = config.routes.LOGIN,
    FORGOT_PASSWORD_PATH = config.routes.FORGOT_PASSWORD,
    ACCOUNT_ACTIVATION = config.security.userStates.ACCOUNT_ACTIVATION,
    PASSWORD_GENERATED = config.security.userStates.PASSWORD_GENERATED;


module.exports = function (app, options) {


        PASSWORD_GENERATED;

    var register = function (req, res) {

        console.log('-----------in register ------------------------------');

        // If all validations have been completed, check if there were errors

        function validate(cb) {

            // Check if there are async validations to be evaluated

            console.log('asyncValFinished: ' + asyncValFinished);
            console.log('asyncValwAITING: ' + asyncValWaiting);

            // Check for all asynchronous validations to be completed
            if (asyncValFinished < asyncValWaiting) return;


            for (var i in form) {
                if (hasOwn.call(form, i)) {
                    if (form[i].errors && form[i].errors.length) {
                        req.flashForm(form, "Sorry, we noticed some errors in your data", formMod.statusCodes.ERROR); // TODO: translate and enhance text

                        console.log('session flash form' + JSON.stringify(req.session.flash.form));
                        return res.redirect(302, REGISTER_PATH);
                    }
                }
            }

            cb();
        }

        function success() {

            // If we got here then we must store the user and then later send a confirmation email
            var activationCode = uid(128);
            var user = new User({
                authId: null,
                //userName: null,
                displayName: form.firstName.value + (form.lastName.value ? (' ' + form.lastName.value) : ''),
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                //gender: String,
                email: form.email.value,
                //password: ,
                role: config.security.default_user,
                accessToken: null,
                refreshToken: null,
                pendingRequest: ACCOUNT_ACTIVATION,
                pendingRequestToken: activationCode,
                pendingRequestTokenExpires: new Date((new Date()).getTime() + config.security.user_activation_minutes_timeout * 60000),
                lastLogin: null, // TODO: ensure this date is updated after a succesful login
                created: new Date(),
                activated: null
            });


            bcrypt.genSalt(10, function(err, salt) {

                bcrypt.hash(form.password.value, salt, function(err, hash) {

                    user.password = hash;
                    user.save(function (err) {
                        if (err) {
                            /*req.session.flash = req.session.flash || {};
                             req.session.flash.message = 'Unable to save new user'; //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                             req.session.flash.intro = 'Unexpected error'; //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                             */
                            req.flashMessage('Sorry, something went wrong while handling your request, perhaps you may want to try it later', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                            return res.redirect(302, REGISTER_PATH);
                        }

                        //Send an email to the user containing a link to end the registration process
                        console.log('Before sending mail');
                        var mailService = mail(app, {});

                        activationMail.to = user.email;
                        res.locals.name = form.firstName.value;
                        res.locals.activationCode = activationCode;
                        res.locals.expireMinutes = config.security.user_activation_minutes_timeout;
                        mailService.sendHTMLEmail(
                            res,
                            activationMail,
                            function success() {
                                // End request sending feedback to the user
                                req.flashMessage('Look at you inbox messages to confirm your registration', 'Your registering process is almost finished');
                                req.flashForm(form, "Thank-you! We've received the following data from you", formMod.statusCodes.VALID); // TODO: translate
                                return res.redirect(302, REGISTER_PATH + '?done=ok'); //TODO: supress query param in success url
                            },
                            function fail(err) {
                                req.flashMessage('Sorry, something went wrong while handling your request, perhaps you may want to try it later', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                                if(err) {
                                    //TODO: if there was an error we should be also tracing the error if we are in development
                                    console.log('ERR:' +  err);
                                }
                                return res.render('_pages/activate');
                            }
                        );
                    });
                });
            });
        };

        console.log('register func');
        /*var form = {
                name: {value: '', errors: []},
                lastName: {value: '', errors: []},
                email: {value: '', errors: []},
                password: {value: '', errors: []},
                password_repeat: {value: '', errors: []}
            }
            ; // store here values and errors of the form
        */
        var form = formMod.create(registrationFields);

        var push = Array.prototype.push;

        var pushError = function (field, strError) {
            var errors = form[field].errors || [];
            push.call(errors, strError);//TODO: use translation function before pushing
        };

        console.log('register func2 ' + JSON.stringify(req.body));


        //TODO: move validations in an other module 'form'

        if (!req.body) {
            //TODO: before redirecting, send to flash the values received form the from with captured errors
            req.flashMessage('Unable to save new user', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
            return res.redirect(302, REGISTER_PATH);
        }

        if (req.body.email) {
            form.email.value = trim(req.body.email);
        }

        console.log('form.email.value: ' + form.email.value);
        if (!form.email.value) {
            console.log('push email error');
            pushError('email', 'Email must be populated');
        }

        if (req.body.firstName) {
            form.firstName.value = capitalize(req.body.firstName);
        }
        if (!form.firstName.value) {
            pushError('firstName', 'Name must be populated');
        }

        if (req.body.lastName) {
            form.lastName.value = capitalize(req.body.lastName);
        }

        if (req.body.password) {
            form.password.value = req.body.password;
        }
        if (!form.password.value) {
            pushError('password', 'Password must be populated');
        }

        if (req.body.password_repeat) {
            form.password_repeat.value = req.body.password_repeat;
        }
        if (!form.password_repeat.value) {
            pushError('password_repeat', 'Password repeat must be populated');
        }

        console.log('register func3 ' + JSON.stringify(form));

        // SYNCHRONOUS VALIDATIONS
        //---------------------

        // Password strength
        if (form.password.value && !password.isStrength(form.password.value)) {
            pushError('password', 'The password is not strong enough');
        }

        console.log('register func4 ' + JSON.stringify(form));

        // Password repeat
        if (form.password.value && form.password_repeat.value &&
            form.password.value !== form.password_repeat.value) {
            pushError('password_repeat', 'The password and the password repetition are different');
        }

        console.log('register func5 ' + JSON.stringify(form));

        // Name
        if (!validator.isValidName(form.firstName.value)) {
            pushError('firstName', 'Must be a valid name');
        }

        // Last Name
        if (!validator.isValidName(form.lastName.value)) {
            pushError(lastName, 'Must be a valid last name');
        }

        // Start of asynchronous validations
        var asyncValFinished = 0,
            asyncValWaiting = 0;

        // Email address
        if (form.email.value) {
            if (!validator.isEmail(form.email.value)) {
                pushError('email', 'Must be a valid email address');
            } else {
                //Ensure it's not a duplicated email address (make a query in Users table)
                console.log('user find one :' + form.email.value);

                asyncValWaiting ++;  //TODO: use async library better

                //Search if there is a user with the same email and is activated or has
                // a pending activation not yet expired
                var now = new Date();

                /* This would be the query if we want to select all that are pending to activate
                User.find({email: form.email.value})
                    .and([
                        {$or:
                            [
                                {activated: {$ne: null}},
                                {$and:
                                    [
                                        {pendingRequest: 'account_activation'},
                                        {pendingRequestTokenExpires: {$ge:now}}
                                    ]
                                }
                            ]
                        }
                    ])
                */

                User.findOne({email: form.email.value, activated: {$ne: null} }, function (err, user) {
                        console.log('in user find one ');

                        if (err) {
                            //TODO: maybe it's better to trwo an error an treat it, , also we should log the error
                            req.flashMessage('Sorry, something went wrong,  you may want to try later', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                            return res.redirect(302, REGISTER_PATH);
                        }

                        console.log('user: ' + JSON.stringify(user));

                        if (user) {
                            console.log('push error email already taken');
                            pushError('email', 'Email address already taken'); // TODO: CHANGE ERROR MESSAGE AND TRANSLATION
                        }
                        asyncValFinished ++;
                        validate(success);
                    }
                );
            }
        }

        validate(success);

    };

    /** Activate
     * This functions gets the user from a requestCode passed in the query of the request.
     * If the code is valid ant the user exists and its'not activated ant he code has not expired
     * then the user it's updated to become activated. Other pending activation codes of the same user.
     * An email is sent when the user has been activated succesfully
     * are deleted
     * @param req
     * @param res
     */
    var activate = function (req, res) {

        var activationCode = req.query.code;
        if (typeof activationCode === 'undefined') {
            res.immediateFlashMessage('You need a valid activation code to authenticate an account', 'Unable to activate account');
            return res.render('_pages/activate');
        }

        //Get user row
        User.findOne({pendingRequest: ACCOUNT_ACTIVATION, pendingRequestToken: activationCode}, function (err, user) {
            console.log('after user findone');
            if (err) {
                req.flashMessage('Sorry, something went wrong while handling your request, perhaps you may want to try it later', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                if(err) {
                    //TODO: if there was an error we should be also tracing the error if we are in development
                }
                return res.render('_pages/activate');
            }
            if (user) {

                console.log('user: ' + JSON.stringify(user));

                // Check if not activationCode is not expired
                var expires = new Date(user.pendingRequestTokenExpires).getTime(),
                    now = new Date().getTime();

                if (expires - now >= 0) {

                    //Delete all pending activations of the current user except this one
                    console.log('find users ' + user.email + ' token different from ' + user.pendingRequestToken);

                    User.remove({
                        email: user.email,
                        pendingRequestToken: {$ne: user.pendingRequestToken}

                    }, function (err) {

                            if(err) {
                                req.flashMessage('Sorry, something went wrong while handling your request, perhaps you may want to try it later', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                                //TODO: if there was an error we should be also tracing the error if we are in development
                                return res.render('_pages/activate');
                            }


                            //Activate user
                            user.activated = now;
                            user.pendingRequest = null;
                            user.pendingRequestToken = null;
                            user.pendingRequestTokenExpires = null;

                            user.save(function (err) {
                                if (err) {
                                    req.flashMessage('Sorry, something went wrong while handling your request, perhaps you may want to try it later', 'Unexpected error'); //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
                                    if (err) {
                                        //TODO: if there was an error we should be also tracing the error if we are in development
                                    }
                                    return res.render('_pages/activate');
                                }
                                var mailService = mail(app, {});
                                welcomeMail.to = user.email;
                                res.locals.name = user.firstName;
                                res.locals.loginUrl = LOGIN_PATH;
                                mailService.sendHTMLEmail(
                                    res,
                                    welcomeMail,
                                    function success() {
                                        // End request sending feedback to the user
                                        req.flashMessage('Your account has been activated, you may enter your credentials below to log in', 'Account activated !');
                                        return res.redirect(LOGIN_PATH);
                                    },
                                    function fail(err) {
                                        // Ignore if an error while sending email confirmation of activation, anyway the account is already
                                        // activated in the database
                                        req.flashMessage('Your account has been activated, you may enter your login credentials below', 'Account activated !');
                                        return res.redirect(LOGIN_PATH);
                                    }
                                );
                            });
                        });

                } else {
                    req.flashMessage('The activation code has expired, please send the registration form again to require for a new one', 'Unable to activate account');
                    req.flashForm(formMod.create(registrationFields, user));
                    res.redirect(REGISTER_PATH);
                }

            } else {
                res.immediateFlashMessage('The activation code received is not valid', 'Unable to activate account');
                return res.render('_pages/activate');
            }

        });

    };

    /**
     * passwordReset
     * This function sends an email to the recipient given in the email body param
     * containing a new valid password. This password only is valid after the next
     * expiring time, after then a new password has to be requested
     * //todo: it has to incorporate a captcha
     *
     * @param req
     * @param res
     */

    var passwordReset = function (req, res) {

        var email = req.query.email
            newPassword = password.generate();

        if (typeof email === 'undefined') {
            res.immediateFlashMessage('You need to introduce a valid email', 'Unable send new pasword');
            return res.render('_pages/passwordReset');
        }

        //TODO:USE VIEWmODEL to get active user by email

        continue from here
        User.findOne()




    }

    //TODO: see if options are needed or delete if not

    return {

        registerRoutes: function () {
            app.get('/register', function (req, res) {
                // If is the first time loading this form, we need to populate locals.flash.form
                if (typeof res.locals.flash.form === 'undefined') {
                    console.log('create empty form the first load');
                    res.immediateFlashForm(formMod.create(registrationFields));
                }

                console.log('req.query.done : ' + req.query.done);
                //TODO: why not use flash also to determine if the form was succesfuly sended instead of wury parameter ?????
                res.locals.done = req.query.done || false;
                res.render('_pages/register');
            });
            app.post(REGISTER_PATH, register);
            app.get(ACTIVATE_PATH, activate);
            app.get(FORGOT_PASSWORD_PATH, passwordReset);
        }
    };

};

