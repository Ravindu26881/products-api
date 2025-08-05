const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', storeSchema);