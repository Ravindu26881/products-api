const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    owner: { type: String, required: true },
    image: { type: String, required: false },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', storeSchema);