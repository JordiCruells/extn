/*jslint node: true */
"use strict";

module.exports = function(app) {

    return function (req, res, next) {

        // create domain for this request
        var domain = require('domain').create();

        domain.on('error', function (error) {
            console.error('DOMAIN ERROR CAUGHT\n', error.stack);
            try {

                //failsafe shutdown in 5 seconds
                setTimeout(function () {
                    console.error('Failsafe shutdown.');
                    process.exit(1);
                }, 5000);

                // disconnnect from the cluster
                var worker = require('cluster').worker;
                if (worker) {
                    worker.disconnect();
                }

                // Stop takling new requests
                app.server.close();


                try {//attempt to use Express error Route
                    next(error);
                } catch (error2) {
                    // if Express error route failed,
                    // try plain node response
                    console.error('Express error mechanism failed. \n', error2.stack);
                    res.statusCode = 500;
                    res.setHeader('content-type', 'text/plain');
                    res.end('Server error');
                }
            }

            catch (error1) {
                console.error('Unable to send 500 error response. \n', error1.stack);
            }

        });

        // add the request and response objects to the domain
        domain.add(req);
        domain.add(res);

        // execute the rest of the request chain in the domain
        domain.run(next);


    };
};