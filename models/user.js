var mongoose = require('mongoose');
var userSchema = mongoose.Schema(
    {
        //_id: Number,
        authId: String,
        //userName: String,
        displayName: String,
        firstName: String, //TODO: populate this field and the following ones when creating users
        lastName: String,
        gender: String,
        email: String,
        password: String,
        role: String,
        accessToken: String,
        refreshToken: String,
        pendingRequest: String,// for example: 'activate', 'change_pasword', ...
        pendingRequestToken: String, // TODO: change password flow not yet implemented
        pendingRequestTokenExpires: Date, // TODO: change password flow not yet implemented
        lastLogin: Date, // TODO: ensure this date is updated after a succesful login
        created: Date,
        activated: Date
    }
);

var User = mongoose.model('User', userSchema);
module.exports = User;