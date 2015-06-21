var request = require('supertest');

// Here we get hold of the express application
// by using the exported 'getApp'-property
//var app = require("./getApp").getApp;
var app = require("../../app");

describe('API tests', function(){
    var attraction = {
        lat: 45.516011,
        lng: -122.682062,
        name: 'Portland Art Museum',
        description: 'Founded in 1892, the Portland Art Museum\'s collection',
        email: 'test@meadowlarktravel.com'
    };

    var base = 'http://192.168.56.101:3000';

    it('should be able to add an atracction', function(done){
        // the request-object is the supertest top level api
        request(app)
            .post('/api2/attraction')
            .send(attraction)
            .expect(200,/"id":/,done); // note that we're passing the done as parameter to the expect
    });

    it('should be able to retrieve an atracction', function (done) {
        // the request-object is the supertest top level api
        request(app)
            .post('/api2/attraction')
            .send(attraction)
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    return done(err);
                }
                console.log('res.body.id: ' + res.body.id);
                request(app)
                    .get('/api2/attraction/' + res.body.id)
                    .expect(function (res) {
                        console.log('res.body: ' + res.body.name);
                        if (typeof res.body.name === 'undefined') {
                            return 'No atraction retrieved';
                        }

                        if (res.body.name !== attraction.name) {
                            return 'Wrong attraction data retireved';
                        }
                    })
                    .end(done);

            }); // note that we're passing the done as parameter to the expect
    });

});
