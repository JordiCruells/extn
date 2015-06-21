var stylus = require('stylus'),
    nodes = stylus.nodes,
    static = require('./static');

var st = function(path) {
    return new nodes.Literal('url(' + static.map(path) + ')');
};

var stylusFunctions = function () {
    return function (style) {
        style.define('_st', st);
    };
};

module.exports = stylusFunctions;