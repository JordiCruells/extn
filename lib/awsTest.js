/*jslint node: true */
"use strict";

var AWS = require('aws-sdk');
var fs = require('fs');

var s3 = new AWS.S3();

s3.setEndpoint('s3-eu-west-1.amazonaws.com'); // This must be set for buckets in other regions than in US

/*var params = {Bucket: 'jordi.cruells.node', Key: 'helloKitty', Body: 'Hello Kitty!'};
 s3.putObject(params, function(err, data) {
 if (err)
 console.log(err)
 else
 console.log("Successfully uploaded data to myBucket/myKey");
 });*/


var bucketParams = {
    Bucket: 'jordi.cruells.uploads', /* required */
    ACL: 'private',
    CreateBucketConfiguration: {
        LocationConstraint: 'eu-west-1'
    }
};

s3.createBucket(bucketParams, function (err, data) {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully created bucket");

        // Now let's store a file
        var filename = '/data/vacation-photo/1431970451564/Jellyfish.jpg';
        s3.putObject({
            ACL: 'private',
            Bucket: 'jordi.cruells.uploads',
            Key: 'Jellyfish.jpg',
            Body: fs.readFileSync('/home/node/expressApp/data/vacation-photo/1431970451564/Jellyfish.jpg')
        }, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully uploaded file");
            }
        });

    }

});
 
  

