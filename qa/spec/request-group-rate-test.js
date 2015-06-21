
var Browser = require('zombie'),
    assert = require('chai').assert;

//var testIP = process.env.APP_PRIVATE_IP_ADDRESS;
var testPort = 3001; 
var basePath = 'http://127.0.0.1:' + testPort;
var app = require('../../app');
var http = require('http');
var server;
var browser;


// Helper methods
function showBrowser() {
  for (var prop in browser) {
    if (browser.hasOwnProperty(prop)) {
      console.log(prop + ":" + browser[prop]);
    }
  }
}

before(function(done){

  app.set('port', testPort);
  server = http.createServer(app);
  server.listen(testPort); 
  done();
});

after(function(done){
  server.close();
  browser.tabs.closeAll();
  done();
});

describe('Request Group Rate', function() {

  it('requesting group rate from the hood river tour page should populate the referrer field', function(done) {
    var link = '/tours/hood-river';
    browser = new Browser({site: basePath, referrer: basePath + link });

    //showBrowser();
    //browser.debug();
    browser.visit(link);
    browser.wait(
      function() {
        browser.clickLink('.requestGroupRate', function() {
          browser.wait(
            function() {
              assert(browser.query('input[name=referrer]').value === basePath + link);
              done();
            }
          );
        });          
      }
    );
  }); //end it

  function Car() {
    this.color = 'blue';
  }

  var car = new Car();



  it('requesting group rate from the oregon tour page should populate the referrer field', function(done) {
    var referrer = '/tours/oregon';
    browser = new Browser({site: basePath, referrer: basePath + link});
    //browser.debug();
    browser.visit(link);
    browser.wait(
      function() {
        browser.clickLink('.requestGroupRate', function() {
          browser.wait(
            function() {
              assert(browser.query('input[name=referrer]').value === basePath + link);
              done();
            }
          );
        });          
      }
    );
  }); //end it

  it('requesting group rate without referring from another page should not fill the referrer field', function(done) {
    var referrer = '';
    var requestGroupPage = '/tours/request-group-rate';
    browser = new Browser({site: basePath});
    //browser.debug();
    browser.visit(requestGroupPage);
    browser.wait(
      function() {
        assert(browser.query('input[name=referrer]').value === referrer);
        done();
      }
    );
  }); //end it



}); //end describe


