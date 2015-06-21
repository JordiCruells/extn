/*jslint node: true */
"use strict";

var nodemailer = require('nodemailer');

module.exports = function (credentials, environment) {

    var mailTransport =
        environment === 'development' ?
            nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: credentials.gmail.user,
                    pass: credentials.gmail.password
                }
            })
            :
        {
            sendMail: function (options, errCallback) {
                console.log("Send mail still not implemented for this environment");
            }
        };

    var from = '"Express App" <jordicru@gmail.com>';
    var errorRecipient = 'jordi_cc@msn.com';

    return {
        send: function (to, subject, body) {
            mailTransport.sendMail({
                    from: from,
                    to: to,
                    subject: subject,
                    html: body,
                    generateTextFromHtml: true
                },
                function (err) {
                    if (err) {
                        console.error('Unable to send email: ' + err);
                    }
                }
            );
        },
        emailError: function (message, filename, exception) {
            var body = "<h1>Express app</h1>" + 'message: ' + '<br><pre>' + message + '</pre></br>';
            if (exception) {
                body += '<br><pre>' + exception + '</pre></br>';
            }
            if (filename) {
                body += '<br><pre>' + filename + '</pre></br>';
            }
            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: 'Express App Error',
                html: body,
                generateTextFromHtml: true
            }, function (err) {
                if (err) {
                    console.error('Unable to send email: ' + err);
                }
            });
        }
    };
};