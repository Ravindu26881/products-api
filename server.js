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
const Store = require('./models/Store');

app.get('/stores', async (req, res) => {
    try {
        const stores = await Store.find();
        res.json(stores);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stores' });
    }
});

app.get('/stores/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
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
        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

app.put('/stores/:id', async (req, res) => {
    try {
        const store = await Store.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
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

// Check if username exists and return basic store info
app.post('/stores/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        
        // Find store by username
        const store = await Store.findOne({ username: username });
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found with this username' });
        }
        
        // Return basic store info (no password)
        res.json({
            success: true,
            store: {
                id: store._id,
                name: store.name,
                owner: store.owner,
                username: store.username
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error checking username' });
    }
});

// Verify password for store login
app.post('/stores/verify-password', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Find store by username
        const store = await Store.findOne({ username: username });
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found with this username' });
        }
        
        // Check if password matches
        const passwordMatches = store.password === password;
        
        res.json({
            success: true,
            passwordMatches: passwordMatches,
            store: passwordMatches ? {
                id: store._id,
                name: store.name,
                owner: store.owner,
                username: store.username,
                email: store.email
            } : null
        });
    } catch (error) {
        res.status(500).json({ error: 'Error verifying password' });
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

app.listen(process.env.PORT || 5000);