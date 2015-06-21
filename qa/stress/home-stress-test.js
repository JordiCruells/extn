/*jshint expr: true*/
var loadtest = require('loadtest');
var expect = require('chai').expect;
var http = require('http');

describe('Stress test for the home page', function() {
  
  it('Homepage should handle 100 requests in a second', function(done) {
    var options = {
      url: 'http://127.0.0.1:3000',
      conncurrency: 4,
      maxRequests: 100
    };
    loadtest.loadTest(options, function(err, result) {
      expect(err).to.not.exist;
      expect(result.totalTimeSeconds).to.be.below(1);
      done();
    });    
  });

});