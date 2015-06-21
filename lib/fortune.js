/*jslint node: true */
"use strict";

var fortuneCookies = [
    "fortune 1",
    "fortune 2",
    "fortune 3"
];

exports.getFortune = function () {
    var idx = Math.floor(Math.random() * fortuneCookies.length);
    return fortuneCookies[idx];
};

