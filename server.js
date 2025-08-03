const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const sharp = require('sharp');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('DB connection error:', err));

// Models
const Product = require('./models/Product');
const User = require('./models/User');

// Product Routes
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/products', async (req, res) => {
    try {
        const productData = { ...req.body };
        
        // If image URL is provided, compress it and save as imageTemp
        if (productData.image) {
            try {
                // Download the image
                const response = await axios.get(productData.image, {
                    responseType: 'arraybuffer'
                });
                
                // Compress the image using sharp
                const compressedImageBuffer = await sharp(response.data)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                
                // Convert to base64 for storage
                const compressedImageBase64 = `data:image/jpeg;base64,${compressedImageBuffer.toString('base64')}`;
                productData.imageTemp = compressedImageBase64;
            } catch (imageError) {
                console.error('Error processing image:', imageError);
                // Continue without image compression if it fails
            }
        }
        
        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
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

// User Routes
app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from response
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
        delete userResponse.password; // Remove password from response
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