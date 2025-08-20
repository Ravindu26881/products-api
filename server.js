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
const User = require('./models/User');
const Order = require('./models/Order');

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

// Update store location coordinates
app.put('/stores/:id/location', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        
        // Validate required coordinates
        if (!lat || !lng) {
            return res.status(400).json({ 
                error: 'Both latitude (lat) and longitude (lng) are required' 
            });
        }
        
        // Convert to string and validate coordinate ranges
        const latStr = lat.toString();
        const lngStr = lng.toString();
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        
        if (isNaN(latNum) || isNaN(lngNum)) {
            return res.status(400).json({ 
                error: 'Latitude and longitude must be valid numbers' 
            });
        }
        
        if (latNum < -90 || latNum > 90) {
            return res.status(400).json({ 
                error: 'Latitude must be between -90 and 90 degrees' 
            });
        }
        
        if (lngNum < -180 || lngNum > 180) {
            return res.status(400).json({ 
                error: 'Longitude must be between -180 and 180 degrees' 
            });
        }
        
        // Update store location coordinates
        const store = await Store.findByIdAndUpdate(
            req.params.id,
            { 
                locationLat: latStr,
                locationLng: lngStr
            },
            { new: true, runValidators: true }
        );
        
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        res.json({
            message: 'Store location updated successfully',
            store: {
                id: store._id,
                name: store.name,
                locationLat: store.locationLat,
                locationLng: store.locationLng
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating store location' });
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

// USER ENDPOINTS

// Create new user
app.post('/users', async (req, res) => {
    try {
        const { username, password, name, address, email, phone } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // // Check if username already exists
        // console.log('Checking username:', username);
        // const existingUser = await User.findOne({ username: username });
        // console.log('Existing user found:', existingUser ? existingUser.username : 'None');
        
        // if (existingUser) {
        //     return res.status(409).json({ error: 'Username already exists' });
        // }
        
        const user = new User({
            username,
            password,
            name,
            address,
            email,
            phone
        });
        
        await user.save();
        
        // Return user data without password
        const { password: _, ...userResponse } = user.toObject();
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('User creation error:', error);
        
        // Handle duplicate username error specifically
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: validationErrors 
            });
        }
        
        res.status(500).json({ 
            error: 'Error creating user',
            details: error.message 
        });
    }
});

// Temporary debug endpoint to see all usernames
app.get('/users/debug-usernames', async (req, res) => {
    try {
        const users = await User.find({}, 'username');
        const usernames = users.map(user => user.username);
        res.json({ 
            count: users.length,
            usernames: usernames 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching usernames' });
    }
});

// Check if username exists
app.post('/users/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        
        const user = await User.findOne({ username: username });
        
        if (!user) {
            return res.json({ exists: false });
        }
        
        res.json({
            exists: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error checking username' });
    }
});

// Check if username and password match (authentication)
app.post('/users/authenticate', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        const user = await User.findOne({ username: username });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const passwordMatches = user.password === password;
        
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Return user data without password
        const { password: _, ...userResponse } = user.toObject();
        res.json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({ error: 'Error authenticating user' });
    }
});

// Get user details by user ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user data without password
        const { password: _, ...userResponse } = user.toObject();
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user details' });
    }
});

// Edit user details
app.put('/users/:id', async (req, res) => {
    try {
        const { name, address, email, phone } = req.body;
        const updateData = {};
        
        // Only include fields that are provided
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user data without password
        const { password: _, ...userResponse } = user.toObject();
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user details' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const { storeId } = req.query;
        let query = {};
        if (storeId) {
            query.store = storeId;
        }
        const products = await Product.find(query).populate('store', 'name isActive');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.get('/stores/:storeId/products', async (req, res) => {
    try {
        const products = await Product.find({ store: req.params.storeId }).populate('store', 'name isActive');
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
        const populatedProduct = await Product.findById(product._id).populate('store', 'name isActive');
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
        const populatedProduct = await Product.findById(product._id).populate('store', 'name isActive');
        res.status(201).json(populatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error creating product' });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('store', 'name isActive');
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
        ).populate('store', 'name isActive');
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

// ORDER ENDPOINTS

// Create new order
app.post('/orders', async (req, res) => {
    try {
        const { products, storeId, userId } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0 || !storeId || !userId) {
            return res.status(400).json({ 
                error: 'Products array (with at least one product), Store ID, and User ID are required' 
            });
        }
        
        // Validate products array structure
        for (const product of products) {
            if (!product.productId || !product.quantity || product.quantity < 1) {
                return res.status(400).json({ 
                    error: 'Each product must have a valid productId and quantity (minimum 1)' 
                });
            }
        }
        
        // Verify that all products exist
        const productIds = products.map(p => p.productId);
        const foundProducts = await Product.find({ _id: { $in: productIds } });
        
        if (foundProducts.length !== productIds.length) {
            return res.status(404).json({ error: 'One or more products not found' });
        }
        
        // Verify that the store and user exist
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Generate unique order ID
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const order = new Order({
            orderId,
            products,
            storeId,
            userId
        });
        
        await order.save();
        
        // Populate the order with related data
        const populatedOrder = await Order.findById(order._id)
            .populate('products.productId', 'name price category')
            .populate('storeId', 'name address')
            .populate('userId', 'username name email phone');
        
        res.status(201).json(populatedOrder);
    } catch (error) {
        res.status(500).json({ error: 'Error creating order' });
    }
});

// Get order by order ID
app.get('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate('products.productId', 'name price category description')
            .populate('storeId', 'name address phone email')
            .populate('userId', 'username name email phone address');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching order' });
    }
});

// Get orders by store ID
app.get('/stores/:storeId/orders', async (req, res) => {
    try {
        const orders = await Order.find({ storeId: req.params.storeId })
            .populate('products.productId', 'name price category')
            .populate('storeId', 'name address')
            .populate('userId', 'username name email phone')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching store orders' });
    }
});

// Get orders by user ID
app.get('/users/:userId/orders', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('products.productId', 'name price category')
            .populate('storeId', 'name address')
            .populate('userId', 'username name email phone')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user orders' });
    }
});

// Get all orders (optional endpoint for admin purposes)
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('products.productId', 'name price category')
            .populate('storeId', 'name address')
            .populate('userId', 'username name email phone')
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Delete order
app.delete('/orders/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        await Order.findByIdAndDelete(order._id);
        res.json({ message: 'Order deleted successfully', orderId: req.params.orderId });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting order' });
    }
});

// Update order status
app.put('/orders/:orderId/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        // Optional: validate status values
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
            });
        }
        
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status: status },
            { new: true, runValidators: true }
        )
        .populate('products.productId', 'name price category')
        .populate('storeId', 'name address')
        .populate('userId', 'username name email phone');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json({
            message: 'Order status updated successfully',
            order: order
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating order status' });
    }
});

app.listen(process.env.PORT || 5000);