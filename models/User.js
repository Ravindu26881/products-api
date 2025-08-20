const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true,},
    password: { type: String, required: true },
    name: { type: String, required: false },
    address: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
