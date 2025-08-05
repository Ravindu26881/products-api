const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sharp = require('sharp');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB connection error:', err));

const Product = require('./models/Product');
const User = require('./models/User');
const Store = require('./models/Store');

app.get('/stores', async (req, res) => {
    try {
        const stores = await Store.find().populate('owner', 'username email');
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stores' });
    }
});

app.get('/stores/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('owner', 'username email');
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching store' });
    }
});

app.post('/stores', async (req, res) => {
    try {
        const store = new Store(req.body);
        await store.save();
        const populatedStore = await Store.findById(store._id).populate('owner', 'username email');
        res.status(201).json(populatedStore);
    } catch (error) {
        res.status(500).json({ error: 'Error creating store' });
    }
});

app.put('/stores/:id', async (req, res) => {
    try {
        const store = await Store.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('owner', 'username email');
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: 'Error updating store' });
    }
});

app.delete('/stores/:id', async (req, res) => {
    try {
        const store = await Store.findByIdAndDelete(req.params.id);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        await Product.deleteMany({ store: req.params.id });
        res.json({ message: 'Store and associated products deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting store' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const { storeId } = req.query;
        let query = {};
        if (storeId) {
            query.store = storeId;
        }
        const products = await Product.find(query).populate('store', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.get('/stores/:storeId/products', async (req, res) => {
    try {
        const products = await Product.find({ store: req.params.storeId }).populate('store', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching store products' });
    }
});

app.post('/products', async (req, res) => {
    try {
        const productData = { ...req.body };
        

        if (productData.store) {
            const store = await Store.findById(productData.store);
            if (!store) {
                return res.status(400).json({ error: 'Store not found' });
            }
        }
        

        if (productData.image) {
            try {

                const response = await axios.get(productData.image, {
                    responseType: 'arraybuffer'
                });
                

                const compressedImageBuffer = await sharp(response.data)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                

                const compressedImageBase64 = `data:image/jpeg;base64,${compressedImageBuffer.toString('base64')}`;
                productData.imageTemp = compressedImageBase64;
            } catch (imageError) {
                console.error('Error processing image:', imageError);

            }
        }
        
        const product = new Product(productData);
        await product.save();
        const populatedProduct = await Product.findById(product._id).populate('store', 'name');
        res.status(201).json(populatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
});

app.post('/stores/:storeId/products', async (req, res) => {
    try {
        const productData = { ...req.body, store: req.params.storeId };
        

        const store = await Store.findById(req.params.storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        

        if (productData.image) {
            try {

                const response = await axios.get(productData.image, {
                    responseType: 'arraybuffer'
                });
                

                const compressedImageBuffer = await sharp(response.data)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                

                const compressedImageBase64 = `data:image/jpeg;base64,${compressedImageBuffer.toString('base64')}`;
                productData.imageTemp = compressedImageBase64;
            } catch (imageError) {
                console.error('Error processing image:', imageError);

            }
        }
        
        const product = new Product(productData);
        await product.save();
        const populatedProduct = await Product.findById(product._id).populate('store', 'name');
        res.status(201).json(populatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('store', 'name');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product' });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('store', 'name');
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            res.status(500).json({ error: 'Error creating user' });
        }
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// User login route
app.post('/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const userResponse = user.toObject();
        delete userResponse.password; // Remove password from response
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: 'Error during login' });
    }
});

app.listen(process.env.PORT || 5000);