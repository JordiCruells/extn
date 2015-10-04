module.exports = function(opts) {

    var options = opts || {};

    return function(req, res, next) {

        if (!req.flashMessage) {
            req.flashMessage = _flashMessage;
        }
        if (!req.flashForm) {
            req.flashForm = _flashForm;
        }

        if (!res.immediateFlashMessage) {
            res.immediateFlashMessage = _immediateFlashMessage;
        }

        if (!res.immediateFlashForm) {
            res.immediateFlashForm = _immediateFlashForm;
        }

        console.log('in flas function, session flash is ' + JSON.stringify(req.session.flash));
        console.log('in flas function, local flash is ' + JSON.stringify(res.locals.flash));
        res.locals.flash = req.session.flash || res.locals.flash || {};

        console.log('in flas function, local flash after is ' + JSON.stringify(res.locals.flash));


        delete req.session.flash;
        next();
    }

};

// This function stores a flash message in the session that
// will be used in the next request
function _flashMessage(message, intro) {

    var req = this;
    //console.log('req in flasMessage: ' + req);
    //console.log('req constructor in flasMessage: ' + req.constructor);
    if (req.session === 'undefined') throw Error('need sessions to store flash');
    req.session.flash = req.session.flash || {};
    req.session.flash.message = (typeof message  === 'string') ? message : ''; //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
    req.session.flash.intro = (typeof intro  === 'string') ? intro : ''; //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION*/
}

// This function stores the form validation results in the session that
// will be used in the next request
function _flashForm(form, message, status) {

    console.log('flashform ' + JSON.stringify(form));
    console.log('flashform ' + message);

    if (typeof form !== 'object') { return;}
    if (typeof message !== 'string') {
        if (typeof message === 'number') {
            if (typeof status === 'string') {
                var tmp = message;
                message = status;
                status = tmp;
            } else {
                status = message;
            }
        } else {
            if (typeof status === 'string') {
                message = status;
            }
        }
    }
    if (typeof status === 'string') {
        message = status;
    }

    var req = this;
    if (req.session === 'undefined') throw Error('need sessions to store flash');

    req.session.flash = req.session.flash || {};

    console.log('typeof form ' + typeof form);

    req.session.flash.form = form;
    if (typeof message === 'string') {
        req.session.flash.form._message = message;
    }
    if (typeof status === 'number') {
        req.session.flash.form._status = status;
    }
}


// This function stores a flash message in the res.locals object
// to be used in the current request
function _immediateFlashMessage(message, intro) {

    var res = this;
    res.locals.flash = res.locals.flash || {};
    res.locals.flash.message = (typeof message  === 'string') ? message : ''; //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION
    res.locals.flash.intro = (typeof intro === 'string') ? intro : ''; //TODO: CHANGE ERROR MESSGE AND USE TRANSLATION*/

}

// This function stores a form validation results object in the res.locals object
// to be used in the current request
function _immediateFlashForm(form, message, status) {

    console.log('in _immediateFlashForm');
    console.log('form ' + JSON.stringify(form));
    var res = this;
    res.locals.flash = res.locals.flash || {};


    // TODO: refactor code, this code and the code in _flashForm are very similar
    if (typeof form !== 'object') { return;}
    if (typeof message !== 'string') {
        if (typeof message === 'number') {
            if (typeof status === 'string') {
                var tmp = message;
                message = status;
                status = tmp;
            } else {
                status = message;
            }
        } else {
            if (typeof status === 'string') {
                message = status;
            }
        }
    }
    if (typeof status === 'string') {
        message = status;
    }

    res.locals.flash.form = form;
    if (typeof message === 'string') {
        res.locals.flash.form._message = message;
    }
    if (typeof status === 'number') {
        res.locals.flash.form._status = status;
    }

    console.log('res.locals.flash.form: ' + JSON.stringify(res.locals.flash.form));
}

