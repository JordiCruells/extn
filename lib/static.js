
//TODO: inject baseUrl depending on environment at startup
var baseUrl = '';

exports.map = function (name) {
    return baseUrl + name;
};
