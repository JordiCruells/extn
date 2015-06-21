var express = require('express');

module.exports = function (app) {

  var authorize = app.locals.auth.orize;

  var router = express.Router({
    caseSensitive : app.get('case sensitive routing'),
    strict: app.get('strict routing')
  });

  //router.use(authorize('@'));

  router.get('/',
             authorize('@'),
             getUser);

  router.get('/:id',
             authorize('*'),
             getId);

  router.post('/',
              authorize('user'),
              createUser);

  return router;

}


// Get
var getUser = function (req, res, next) {
  //res.send('respond with a resource');
  res.send(200, {name: 'Jordi'});
};

var getId = function (req, res, next) {
  //res.send('respond with a resource');
  res.send(200, {name: 'Jordi'});
};

var createUser = function (req, res, next) {
  var name = req.body.username;
  var email = req.body.email;
  // store it
  res.send(200, name + " is stored");
};