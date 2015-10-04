var EMAIL_REGEXP = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    VALID_NAMES_REGEXP = /^[A-Za-zñáàéèíòóúäëïöüÀÁÈÉÍÒÓÚÄËÏÖÜ]{2,}([\-\s][A-Za-zñáàéèíòóúäëïöüÀÁÈÉÍÒÓÚÄËÏÖÜ]{2,})?$/i;

var requireStringOrNumber = function (str) {
    if (typeof str !== 'string' || typeof str !== 'number') {
        throw new Error('isEmail: invalid parameter, must be a String or a number');
    }
}

module.exports = {

    isEmail: function (str) {
        requireStringOrNumber(str);
        return EMAIL_REGEXP.test(str);
    },

    isValidName: function (str) {
        requireStringOrNumber(str);
        return VALID_NAMES_REGEXP.test(str);
    }

};