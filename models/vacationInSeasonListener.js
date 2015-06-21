/*jslint node: true */
"use strict";

var moongose = require("mongoose");

var vacationInSeasonListenerSchema = moongose.Schema({
    email: String,
    skus: [String]
});

var VacationInSeasonListener = moongose.model('VacationInSeasonListener', vacationInSeasonListenerSchema);

module.exports = VacationInSeasonListener;
