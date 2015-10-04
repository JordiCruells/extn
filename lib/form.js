
var _form = function () {

    console.log('-----------------------------------------');

    var form = {};
    console.log('form arguments ' + JSON.stringify(arguments));

    // When arguments are a list of strings ('name', 'email',...)
    // we return a form with this fields all of them empty
    if (typeof arguments[0] === 'string') {

        console.log('constructor 1');

        var fields = arguments;
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (typeof field === 'string') {
                form[field] = {value: '', errors: []};
            }
        }
        form._message = '';
        form._status = 0;

        console.log('form de tronada: ' + JSON.stringify(form));
        return form;
    }

    // the first argument is an array of strings containing the field names and
    // the second object (if present) is and object from which obtain the values
    else if (arguments[0] instanceof Array) {

        console.log('constructor 2');

        var list = arguments[0],
            model = (typeof arguments[1] === 'object') ? arguments[1] : {};

        for (var i = 0; i < list.length; i++) {
            var field = list[i];
            console.log('i: ' + i );
            console.log('field: ' + field );
            console.log('model: ' +     JSON.stringify(model) );
            if (typeof field === 'string') {
                var formItem = {};
                console.log('model[field]: ' + model[field]);
                console.log('typeof model[field]: ' + typeof model[field]);
                formItem.value = (typeof model[field] === 'string' || typeof model.field === 'number') ? model[field] : '';
                console.log('formItem.value: ' + formItem.value);
                formItem.errors = [];
                form[field] = formItem;
            }
        }
        form._message = '';
        form._status = 0;

        console.log('form de tronada: ' + JSON.stringify(form));
        return form;
    }

    // When first argument is an object we create the form object
    // upon its properties
    else if (typeof arguments[0] === 'object') {

        console.log('constructor 3');

        var object = arguments[0],
            hasOwn = Object.hasOwnProperty;

        for (var prop in object) {
            if (hasOwn.call(object, prop)) {
                var val = object[prop];

                if (typeof val === 'string') {
                    form[prop] = {value: val, errors: []};
                }
                else if (typeof val === 'object') {
                    var formItem = {};
                    formItem.value = (typeof val.value === 'string' || typeof val.value === 'number') ? val.value : '';
                    formItem.errors = (typeof val.errors === 'array') ? val.errors : []; //TODO: list of errors must be a list of strings
                    formItem.validations = (typeof val.validations === 'object') ? val.validations : {}; //TODO: ensure only valid validations are allowed
                    form[prop] = formItem;
                }
            }
        }

        //TODO: check the form is not empty
        form._message = '';
        form._status = 0;
        console.log('form de tronada: ' + JSON.stringify(form));
        return form;

    } else {
        return;
    }

};

module.exports = {

    statusCodes: {'ERROR':-1, 'UNKNOWN': 0, 'VALID': 1},
    create : _form

};