#!/usr/bin/env node

console.log("test-preloads.js");
console.log("Download files from CDN's to folder /public/assets/");
console.log("------------------------------------------------------");
var externalFiles = require('./lib/externalFiles.js');
externalFiles.download(__dirname + '/public/assets/');
