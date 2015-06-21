/*jslint node: true */
"use strict";

var fs = require('fs'),
    http = require('http');

var files = [
    {
        name: 'bootstrap.min.css',
        url: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
        type: 'css',
        position: 'head'
    },
    {name: 'jquery.min.js', url: '//code.jquery.com/jquery.min.js', type: 'js', position: 'head'},
    {
        name: 'bootstrap.min.js',
        url: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js',
        type: 'js',
        position: 'head'
    }
];

var download = function (path, callback) {

    var numFiles = files.length,
        filesDownloaded = 0;


    var checkEndDownloads = function () {
        if (filesDownloaded === numFiles) {
            console.log("All files downloaded.");
            if (typeof callback === 'function') {
                console.log('calling callback');
                callback();
            }
        } else {
            setTimeout(checkEndDownloads, 1000);
        }
    };

    var pipeFile = function (file) {
        return function (response) {
            response.pipe(file);
            file.on('finish', function () {
                console.log("...file '" + thisFile.url + "' saved as " + thisFile.name);
                filesDownloaded += 1;
            });
        };
    };

    for (var i = files.length - 1; i >= 0; i--) {
        var thisFile = files[i];
        http.get('http:' + thisFile.url, pipeFile(fs.createWriteStream(path + thisFile.name)));
        console.log("Downloading " + thisFile.url + "... ");
    }

    checkEndDownloads();

};

// Module API
exports.download = download;
exports.list = function () {
    return files;
};



