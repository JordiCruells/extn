var mongoose = require('mongoose');
var userSchema = mongoose.Schema(
    {
        //_id: Number,
        authId: String,
        userName: String,
        displayName: String,
        email: String,
        password: String,
        role: String,
        accessToken: String,
        refreshToken: String,
        created: Date
    }
);

var User = mongoose.model('User', userSchema);
module.exports = User;