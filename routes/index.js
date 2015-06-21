var express = require('express');

module.exports = function (app) {

  var router = express.Router({
    caseSensitive : app.get('case sensitive routing'),
    strict: app.get('strict routing')
  });

  /* GET home page. */

  router.get('/', function(req, res, next) {
    console.log('index');
    res.render('index', { title: 'Express' });
  });

  return router;
};
