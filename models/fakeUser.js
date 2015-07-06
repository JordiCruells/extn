// TODO : remove this module, we must only use the user.js

(function () {
  'use strict';

  //var cache = {};

  module.exports.findOrCreate = function (profile, cb) {
    console.log('findOrCreate profile', profile);
    cb(null, profile);
  };
}());
