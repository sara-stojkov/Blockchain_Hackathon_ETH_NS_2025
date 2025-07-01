const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
