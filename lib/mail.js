
//TODO:translate literals in this module

var nodemailer = require('nodemailer'),
    credentials = require('../credentials');

var _developmentMailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: credentials.gmail.user,
        pass: credentials.gmail.password
    }
});


module.exports = function (app, options) {

    var opts = options || {};
    var environment = app.get('env');
    var defaultFrom = credentials.emails[environment].default;

    switch (environment) {
        case 'development':
            return {
                sendTextMail: function (params, fail, success) {

                    if (!params.to || !params.subject || !params.text ) {
                        throw Error('Missing parameters in sendTextMail function');
                    }

                    _developmentMailTransport.sendMail({
                        from: params.from || defaultFrom,
                        to: params.to,
                        subject: params.subject,
                        text: params.text
                    }, function (err) {
                        if (err) {
                            if (fail) {
                                fail(params, err);
                            } else {
                                throw Error('Unable to send mail');
                            }
                        }
                        if (success) {
                            success();
                        }
                    });
                },

                sendHTMLEmail: function(res, params, success, fail) {

                    if (!params.to || !params.subject || !params.template ) {
                        throw Error('Missing parameters in sendHTMLMail function');
                    }

                    res.render(params.template, function (err, html) {
                        if (err) console.log('error in mail template:' + params.template + 'err:' + err); //TODO: throw error

                        _developmentMailTransport.sendMail({
                            from: params.from || defaultFrom,
                            to: params.to,
                            subject: params.subject,
                            html: html,
                            generateTextFromHtml: true
                        }, function (err) {
                            if (err) {
                                if (fail) {
                                    fail(err);
                                } else {
                                    throw Error('Unable to send mail');
                                }
                            }
                            if (success) {
                                success();
                            }
                        });
                    });
                }
            };

        case 'production':
            return {
                sendTextMail: function (params, fail, success) {
                    //TODO: implement for a production case
                    throw Error('mail not implement for production environment');
                },
                sendHTMLEmail: function (params, fail, success) {
                    //TODO: implement for a production case
                    throw Error('mail not implement for production environment');
                }
            };

    };

};