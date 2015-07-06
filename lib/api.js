var apiOptions = {
    context: '/',
    domain: require('domain').create()
};

module.exports.apiOptions = apiOptions;
module.exports.init = function (app) {

    // API ROUTES (using connect-rest)
    // CAUTION: api paths should be treated after the other paths
    // Rest api using connect-rest (iin this case listening from api.* subdmonain)

    apiOptions.domain.on('error', function (err) {
        console.log('API domain error.\n', err.stack);
        setTimeout(function () {
            console.log('Server shutting down after PAI domain error');
            process.exit(1);
        }, 5000);
        app.
            app.server.close();
        var worker = require('cluster').worker;
        if (worker) {
            worker.disconnect();
        }
    });

};


