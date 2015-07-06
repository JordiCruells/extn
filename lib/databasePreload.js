/**
 * Created by Jordi on 04/07/2015.
 */

var Vacation = require('../models/vacation'),
    User = require('../models/user');

// Preload database

module.exports = function (app) {

    console.log("dbpreload app.get('env')");
    console.log(app.get('env'));

    return function () {

        switch (app.get('env')) {

            case 'development':

                User.findOne({userName: 'bob'}, function (err, user) {
                    if (err) {
                        console.log("Error when searching User db for username " + username + '.Error: ' + err);
                    }
                    if (!user) {
                        console.log('Username Bob is not found');
                        new User({
                            authId: 'local',
                            userName: 'bob',
                            displayName: 'Bob Smith',
                            email: 'boby77lk@gmail.com',
                            password: 'secret',
                            role: 'user',
                            accessToken: '',
                            refreshToken: '',
                            created: (new Date())
                        }).save(function (err) {
                                if (err) {
                                    console.log('error when saving: ' + err);
                                }
                                console.log('... saved');
                            });
                    }
                });

                User.findOne({userName: 'joe'}, function (err, user) {
                    if (err) {
                        console.log("Error when searching User db for username " + username + '.Error: ' + err);
                    }
                    if (!user) {
                        console.log('Username joe is not found');
                        new User({
                            authId: 'local',
                            userName: 'joe',
                            displayName: 'Joe Davis',
                            email: 'jowill@gmail.com',
                            password: 'password',
                            role: 'user',
                            accessToken: '',
                            refreshToken: '',
                            created: (new Date())
                        }).save(function (err) {
                                if (err) {
                                    console.log('error when saving: ' + err);
                                }
                                console.log('... saved');
                            });
                    }
                });


                Vacation.find(function (err, vacations) {

                    if (vacations.length) return;

                    new Vacation({
                        name: "hood river",
                        slug: "hood-river",
                        category: "day-trip",
                        sku: "HR1999",
                        description: "Spend a day sailing",
                        priceInCents: 9995,
                        tags: ['day trip', 'hood river'],
                        inSeason: true,
                        available: true,
                        requiresWaiver: false,
                        maximumGuests: 16,
                        notes: '',
                        packagesSold: 0
                    }).save();

                    new Vacation({
                        name: "dark mountain",
                        slug: "dark-mountain",
                        category: "weekend getaway",
                        sku: "OCR39",
                        description: "eNJOY THE OCEAN AIR",
                        priceInCents: 259995,
                        tags: ['weekend', 'mountain'],
                        inSeason: false,
                        available: true,
                        requiresWaiver: false,
                        maximumGuests: 8,
                        notes: '',
                        packagesSold: 0
                    }).save();

                    new Vacation({
                        name: "rock climbing",
                        slug: "rock-climbing",
                        category: "adventure",
                        sku: "OCR39",
                        description: "eNJOY THE OCEAN AIR",
                        priceInCents: 259995,
                        tags: ['weekend', 'mountain'],
                        inSeason: true,
                        available: true,
                        requiresWaiver: false,
                        maximumGuests: 8,
                        notes: '',
                        packagesSold: 0
                    }).save();

                });
        }

    };

};

