#!/usr/bin/env node

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

/**
 * Module dependencies.
 */

var app = require('../app'),
    debug = require('debug')('expressApp:server'),
    https = require('https'),
    fs = require('fs'),
    options = {
        key: fs.readFileSync(__dirname + '/../expressApp.pem'),
        cert:  fs.readFileSync(__dirname + '/../expressApp.crt')
    };

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '443');
app.set('port', port);


// If we are executing this module, start node server
// otherwise return a link to be started from another entry point
if (require.main == module) {
    startServer();
} else {
    module.exports = startServer;
}


function startServer() {

    /**
     * Create HTTP server.
     */
    server = https.createServer(options, app);
    /**
     * Listen on provided port, on all network interfaces.
     */

    console.log('startSSLServer');
    console.log('port: ' + port);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    // Hold a reference to the server within the app
    app.server = server;

    return server;
}


