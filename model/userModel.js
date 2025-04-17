const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['0', '1'], // 0: admin, 1: user
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;