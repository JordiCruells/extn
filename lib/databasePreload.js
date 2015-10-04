/**
 * Created by Jordi on 04/07/2015.
 */

var Vacation = require('../models/vacation'),
    config = require('../credentials').database.prepareDB,
    hasOwn = Object.hasOwnProperty,
    async = require('async');

// Preload database

    module.exports = function (app) {

    console.log("dbpreload app.get('env')");
    console.log(app.get('env'));

    return function () {

        if (app.get('env') !== 'development') {
            throw new Error("Database preloads only allowed under development environment");
        }

        if (typeof config.clean !== 'undefined' && !(config.clean instanceof Array)) {
            throw new Error("Database preload: models to clean must be an array");
        }
        if (typeof config.delete !== 'undefined' && !(config.delete instanceof Array)) {
            throw new Error("Database preload: models to delete must be an array");
        }
        if (typeof config.populate !== 'undefined' && !(config.populate instanceof Array)) {
            throw new Error("Database preload: models to populate  must be an array");
        }
        var cleanModels = (typeof config.clean === 'undefined') ? [] : config.clean,
            deleteModels = (typeof config.delete === 'undefined') ? [] : config.delete,
            populateModels = (typeof config.populate === 'undefined') ? [] : config.populate;

        switch (app.get('env')) {

            case 'development':

                var tasks = [
                    function (callback) {
                        console.log('1');
                        // Perform cleaning of models
                        var parallel = []; // deletions can be done in parallel

                        cleanModels.forEach(function (modelName) {
                            if (typeof modelName !== 'string') {
                                callback(new Error('Invalid modelname: ' + modelName, 'datavasePreload.js'), null);
                            }
                            var model = require('../models/' + modelName);

                            parallel.push(function (callback) {
                                model.remove({}, function (err, res) {
                                    if (err) {
                                        callback(new Error('Unable to remove items from model ' + modelName + '\n' + err), null);
                                    }
                                    console.log('Model ' + modelName + ' clean. ' + res.result.n + ' records deleted.');
                                    callback(null,null);
                                });
                            });
                        });

                        if (parallel.length) {
                            async.parallel(parallel, function (err) {
                                if (err) {
                                    //TODO:  we may use transactions if we are serious and perform a rollback whenever an error is produced
                                    callback(err, null);
                                }
                                console.log('end 1');
                                callback(null, null);
                            });
                        } else {
                            console.log('end 1');
                            callback(null, null);
                        }

                    },
                    function (callback) {
                        console.log('2');
                        // Perform selective deletions
                        var parallel = [];
                        deleteModels.forEach(function (del) {
                            for (key in del) {
                                if (hasOwn.call(del, key)) {
                                    var modelName = key,
                                        criteria = del[key];
                                    var model = require('../models/' + modelName);
                                    if (typeof criteria !== 'object') {
                                        callback(new Error('Invalid criteria for delete in model ' + modelName), null);
                                    }
                                    parallel.push(function (callback) {
                                        model.remove(criteria, function (err, res) {
                                            if (err) {
                                                callback(new Error('Unable to remove items from model ' + modelName + ' with criteria ' + JSON.stringify(criteria) + '\n' + err), null);
                                            }
                                            console.log(res.result.n + ' records from model ' + modelName + ' deleted according to criteria ' + JSON.stringify(criteria));
                                            callback(null,null);
                                        });

                                    });
                                }
                            }
                        });
                        if (parallel.length) {
                            async.parallel(parallel, function (err) {
                                if (err) {
                                    //TODO:  we may use transactions if we are serious and perform a rollback whenever an error is produced
                                    callback(err, null);
                                }
                                console.log('end 2');
                                callback(null, null);
                            });
                        } else {
                            console.log('end 2');
                            callback(null, null);
                        }

                    },
                    function (callback) {
                        console.log('3');
                        // Perform selective populations (will get the data from /data/db)
                        var series = []; // Perform populating in series to avoid at some point to insert a record twice
                        var created = 0,
                            existing = 0;

                        populateModels.forEach(function (modelName) {
                            if (typeof modelName !== 'string') {
                                callback(new Error('Invalid modelname ' + modelName, 'datavasePreload.js'),null);
                            }
                            var model = require('../models/' + modelName);
                            var data = require('../data/db/' + modelName + 'Data');

                            if (!(data instanceof Array)) {
                                callback(new Error('Data for model' + modelName + 'must be an array'), null);
                            }

                            data.forEach(function (item) {

                                if (typeof item !== 'object') {
                                    callback(new Error('Invalid data record for model ' + modelName), null);
                                }
                                series.push(function (callback) {
                                    model.findOne(item, function (err, result) {
                                        if (err) {
                                            callback(new Error('error in findOne in ' + modelName + 'JSON: ' + JSON.stringify(item) + '\n' + err), null);
                                        }

                                        if (!result) {
                                                model.create(item, function (err) {
                                                    if (err) {
                                                        callback(new Error('error in create in ' + modelName + 'JSON: ' + JSON.stringify(item) + '\n' + err), null);
                                                    }
                                                    created ++;
                                                    callback(null, null);
                                                });
                                        } else {
                                            existing++;
                                        }
                                    });
                                });
                            });
                        });

                        if (series.length) {
                            async.series(series, function (err) {
                                if (err) {
                                    //TODO:  we may use transactions if we are serious and perform a rollback whenever an error is produced
                                    callback(err, null);
                                }
                                console.log(created + ' records created using data, ' + existing + ' already existed');
                                console.log('end 3');
                                callback(null, null);
                            });
                        } else {
                            console.log('No records populated');
                            console.log('end 3');
                            callback(null, null);
                        }
                    }
                ];


                //Run the tasks
                async.series(tasks, function (err, results) {
                    if (err) {
                        throw err;
                    }
                });

                break;
            default:
                return;
        }
    };
};

