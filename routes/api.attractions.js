
/*

THIS IS THE VERSION USING SIMPLE ROUTER

ABOVE IS THE VERSION USING CONNECT-REST

var Attraction = require('../models/attraction');
var express = require('express');
var router = express.Router();

router.get('/api/attractions', function(req, res) {
    Attraction.find({ approved: true }, function (err, attractions) {
        if (err) {
            return res.send(500, 'Error ocurred: database error');
        }
        res.json(attractions.map(function (a) {
            return {
                name: a.name,
                id: a._id,
                description: a.description,
                location: a.location
            };
        }));
    });
});

router.post('/api/attraction', function(req, res) {

    var a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: {
            lat: req.body.lat,
            lng: req.body.lng
        },
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date()
        },
        approved: false
    });

    a.save(function (err, a) {
        if (err) {
            return res.send(500, 'Error occurred: database error');
        }
        res.json({ id: a._id });
    });
});

router.get('/api/attraction/:id', function (req, res) {
    Attraction.findById(req.params.id, function (err, a) {
        if (err) {
            return res.send(500, 'Error occrured: database error');
        }
        res.json({
            name: a.name,
            id: a._id,
            description: a.description,
            location: a.location
        });
    });
});

module.exports = router;

*/


//Restful api
module.exports = function (app) {

    var rest = require('connect-rest');
    var apiOptions = require('../lib/api').apiOptions;
    var Attraction = require('../models/attraction');
    var vhost = require('vhost');

    rest.get('/attractions', function (req, content, callback) {
        console.log('in attractions');
        console.log('Attraction:');
        console.log('Attraction: ' + Attraction);
        Attraction.find({approved: true}, function (err, attractions) {
            console.log('in attractions find');
            if (err) {
                console.log('in attractions find error');
                return callback({error: 'Internal error'});
            }
            callback(null, attractions.map(function (a) {
                console.log('in attractions find callback');
                return {
                    name: a.name,
                    description: a.description,
                    location: a.location
                };
            }));
        });
    });

    rest.post('/attraction', function (req, content, callback) {
        console.log('in post attraction');
        console.log('req.body : ' + req.body);
        console.log('\n\n');
        console.log('content : ' + content);
        var a = new Attraction({
            name: req.body.name,
            description: req.body.description,
            location: {
                lat: req.body.lat,
                lng: req.body.email,
                date: new Date()
            },
            approved: false
        });
        a.save(function (err, a) {
            if (err) {
                return callback({error: 'Unable to add attraction'});
            }
            callback(null, {id: a._id});
        });
    });

    rest.get('/attraction/:id', function (req, content, callback) {

        console.log('in get attraction id');
        console.log(req.params.id);

        Attraction.findById(req.params.id, function (err, attraction) {
            console.log('0');
            console.log('err: ' + err);
            if (err) {
                console.log('1' + err);
                return callback({error: 'Unable to retrieve attraction'});
            }
            console.log('33');
            console.log(attraction);

            if (attraction) {
                callback(null, {
                    name: attraction.name,
                    description: attraction.description,
                    location: attraction.location
                });
            } else {
                callback(null, {error: 'No data found'});
            }
        });
    });

    app.use(vhost('api.*.com', rest.rester(apiOptions)));
};
