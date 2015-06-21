var request = require('supertest');


// Here we get hold of the express application 
// by using the exported 'getApp'-property
//var app = require("./getApp").getApp;
var app = require("../../app");
 
describe('GET /users', function(){
  it('respond with json', function(done){
    // the request-object is the supertest top level api
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done); // note that we're passing the done as parameter to the expect
  });
});

describe("Posting is easy to test with supertest", function (){
 
  it("posts a new user to /users", function(done){
    var user = { username : 'marcus', email : 'marcus@marcus.com'};
 
    request(app)
      .post("/users")
      .send(user)
      .expect(200)
      .expect("marcus is stored", done);
  });
});