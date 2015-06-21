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