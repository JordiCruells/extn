/*jslint node: true */
"use strict";


// myI18n
var i18n = require('i18n');
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'iw'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: __dirname + '/../locales',

    defaultLocale: 'en',
    // sets a custom cookie name to parseProfile locale settings from  - defaults to NULL
    cookie: 'lang'
});

/*module.exports = function(req, res, next) {

    console.log('1');
    i18n.init(req, res);
    console.log('2');
    res.local('__', res.__);
    console.log('3');
    var current_locale = i18n.getLocale();
    console.log('4');
    return next();
};
*/
