const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, required: false },
    description: { type: String, required: false },
    quantity: { type: Number, required: false },
});

module.exports = mongoose.model('Product', productSchema);
