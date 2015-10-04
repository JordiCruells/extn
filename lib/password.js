// Calculates password strength (extracted from https://github.com/aarondo/Strength.js/blob/master/src/strength.js)

var MIN_STRENGTH = 50,
    PASSWORD_GENERATE_SIZE = 10;

module.exports = {

    value: function (s) {

        if (typeof s !== 'string') {
            throw new Error('Parameter must be a valid string in function value',__filename);
        }
        var specialchars = new RegExp('([!,%,&,@,#,$,^,*,?,_,~])');
        var upperCase = new RegExp('[A-Z]');
        var lowerCase = new RegExp('[a-z]');
        var numbers = new RegExp('[0-9]');

        var characters = 0;
        var capitalletters = 0;
        var loweletters = 0;
        var number = 0;
        var special = 0;

        if (s.length > 8) {
            characters = 1;
        } else {
            characters = -1;
        }
        if (s.match(upperCase)) {
            capitalletters = 1
        } else {
            capitalletters = 0;
        }
        if (s.match(lowerCase)) {
            loweletters = 1
        } else {
            loweletters = 0;
        }
        if (s.match(numbers)) {
            number = 1
        } else {
            number = 0;
        }
        if (s.match(specialchars)) {
            special = 1
        } else {
            special = 0;
        }

        var total = characters + capitalletters + loweletters + number + special;
        return ((total / 7) * 100).toFixed(0);

    },

    isStrength: function(str) {
        return (self.value(str) >= MIN_STRENGTH) ;
    },

    generate: function() {
        var pwd;
        do {
            pwd = require('utils').uid(PASSWORD_GENERATE_SIZE);
        } while (self.isStrength(pwd));
        return pwd;
    }




};
