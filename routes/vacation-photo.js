
/*jshint -W030 */
var express = require('express');

var formidable = require('formidable');
var fs = require('fs');

var dataDir = __dirname + '/../data';
var vacationPhotoDir = dataDir + '/vacation-photo';
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir) || fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName, email, year, month, photoPath) {
  // todo
}

module.exports = function (app) {

  var router = express.Router({
    caseSensitive: app.get('case sensitive routing'),
    strict: app.get('strict routing')
  });

  router.get('/', function (req, res, next) {
    var now = new Date();
    res.render('forms-examples/vacation-photo', {year: now.getFullYear(), month: now.getMonth()});
  });

  router.post('/:year/:month', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      if (err) return res.redirect(303, '_pages/error');
      if (err) {
        res.session.flash = {
          type: 'danger',
          intro: 'Oops!',
          message: 'There was an error procesing your submission. Please try again.'
        };
        return res.redirect(303, '/vacation-photo');
      }

      console.log('received fields: ' + fields);
      console.log('received files: ' + files);

      var photo = files.photo;
      var dir = vacationPhotoDir + '/' + Date.now();
      var path = dir + '/' + photo.name;
      fs.mkdirSync(dir);
      console.log('photo.name: ' + photo.name);
      console.log('photo.path: ' + photo.path);
      console.log('dir: ' + dir);
      fs.renameSync(photo.path, dir + '/' + photo.name);
      saveContestEntry('vacation-photo', fields.email, req.params.year, req.params.month, path);
      req.session.flash = {
        type: 'success',
        intro: 'Good Luck!',
        message: 'You haave entered into the contest'

      };
      return res.redirect(303, '/vacation-photo');
      //res.redirect(303, '/thank-you');
    });
  });

  return router;
};
