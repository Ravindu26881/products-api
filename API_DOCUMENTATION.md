# Products API Documentation

This is a comprehensive RESTful API for managing stores, users, products, and orders. The API is built with Node.js, Express, and MongoDB.

## Base URL
```
http://localhost:5000
```

## Authentication
Currently, the API uses simple username/password authentication without JWT tokens. All routes are publicly accessible.

---

## Store Endpoints

### 1. Get All Stores
- **URL:** `GET /stores`
- **Description:** Retrieve all stores in the system
- **Request Body:** None
- **Response:** Array of store objects
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

**Example Response:**
```json
[
  {
    "_id": "64f123456789abcdef123456",
    "name": "Tech Store",
    "description": "Electronic devices and gadgets",
    "address": "123 Main St, City",
    "phone": "+1234567890",
    "email": "tech@store.com",
    "owner": "John Doe",
    "username": "techstore",
    "category": "Electronics",
    "isActive": true,
    "createdAt": "2023-09-01T10:00:00.000Z"
  }
]
```

### 2. Get Store by ID
- **URL:** `GET /stores/:id`
- **Description:** Retrieve a specific store by its MongoDB ObjectId
- **URL Parameters:** `id` - MongoDB ObjectId of the store
- **Response:** Store object
- **Status Codes:**
  - `200`: Success
  - `404`: Store not found
  - `500`: Server error

### 3. Create New Store
- **URL:** `POST /stores`
- **Description:** Create a new store
- **Request Body:**
```json
{
  "name": "Tech Store",
  "description": "Electronic devices and gadgets",
  "address": "123 Main St, City",
  "phone": "+1234567890",
  "email": "tech@store.com",
  "owner": "John Doe",
  "username": "techstore",
  "password": "securePassword123",
  "category": "Electronics",
  "image": "https://example.com/store-image.jpg"
}
```
- **Required Fields:** `name`, `owner`, `username`, `password`, `category`
- **Status Codes:**
  - `201`: Store created successfully
  - `400`: Invalid request data
  - `500`: Server error

### 4. Update Store
- **URL:** `PUT /stores/:id`
- **Description:** Update an existing store
- **URL Parameters:** `id` - MongoDB ObjectId of the store
- **Request Body:** Any fields to update (same as create, but all optional)
- **Status Codes:**
  - `200`: Store updated successfully
  - `404`: Store not found
  - `500`: Server error

### 5. Delete Store
- **URL:** `DELETE /stores/:id`
- **Description:** Delete a store and all its associated products
- **URL Parameters:** `id` - MongoDB ObjectId of the store
- **Status Codes:**
  - `200`: Store and products deleted successfully
  - `404`: Store not found
  - `500`: Server error

### 6. Update Store Location
- **URL:** `PUT /stores/:id/location`
- **Description:** Update store's GPS coordinates
- **URL Parameters:** `id` - MongoDB ObjectId of the store
- **Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```
- **Validation:** 
  - Latitude: -90 to 90 degrees
  - Longitude: -180 to 180 degrees
- **Status Codes:**
  - `200`: Location updated successfully
  - `400`: Invalid coordinates
  - `404`: Store not found
  - `500`: Server error

### 7. Check Store Username
- **URL:** `POST /stores/check-username`
- **Description:** Check if a store username exists
- **Request Body:**
```json
{
  "username": "techstore"
}
```
- **Response:**
```json
{
  "success": true,
  "store": {
    "id": "64f123456789abcdef123456",
    "name": "Tech Store",
    "owner": "John Doe",
    "username": "techstore"
  }
}
```
- **Status Codes:**
  - `200`: Username found
  - `404`: Username not found
  - `400`: Username required
  - `500`: Server error

### 8. Verify Store Password
- **URL:** `POST /stores/verify-password`
- **Description:** Authenticate store login
- **Request Body:**
```json
{
  "username": "techstore",
  "password": "securePassword123"
}
```
- **Response:**
```json
{
  "success": true,
  "passwordMatches": true,
  "store": {
    "id": "64f123456789abcdef123456",
    "name": "Tech Store",
    "owner": "John Doe",
    "username": "techstore",
    "email": "tech@store.com"
  }
}
```
- **Status Codes:**
  - `200`: Authentication result returned
  - `404`: Store not found
  - `400`: Username and password required
  - `500`: Server error

---

## User Endpoints

### 1. Create New User
- **URL:** `POST /users`
- **Description:** Register a new user
- **Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123",
  "name": "John Doe",
  "address": "456 Oak St, City",
  "email": "john@example.com",
  "phone": "+1987654321"
}
```
- **Required Fields:** `username`, `password`
- **Response:** User object (password excluded)
- **Status Codes:**
  - `201`: User created successfully
  - `400`: Username and password required
  - `409`: Username already exists
  - `500`: Server error

### 2. Check Username Availability
- **URL:** `POST /users/check-username`
- **Description:** Check if a username is available
- **Request Body:**
```json
{
  "username": "johndoe"
}
```
- **Response:**
```json
{
  "exists": true,
  "user": {
    "id": "64f123456789abcdef123456",
    "username": "johndoe",
    "name": "John Doe"
  }
}
```
- **Status Codes:**
  - `200`: Check completed
  - `400`: Username required
  - `500`: Server error

### 3. Authenticate User
- **URL:** `POST /users/authenticate`
- **Description:** User login authentication
- **Request Body:**
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```
- **Response:**
```json
{
  "success": true,
  "user": {
    "_id": "64f123456789abcdef123456",
    "username": "johndoe",
    "name": "John Doe",
    "address": "456 Oak St, City",
    "email": "john@example.com",
    "phone": "+1987654321",
    "createdAt": "2023-09-01T10:00:00.000Z"
  }
}
```
- **Status Codes:**
  - `200`: Authentication successful
  - `401`: Invalid credentials
  - `400`: Username and password required
  - `500`: Server error

### 4. Get User by ID
- **URL:** `GET /users/:id`
- **Description:** Retrieve user details by MongoDB ObjectId
- **URL Parameters:** `id` - MongoDB ObjectId of the user
- **Response:** User object (password excluded)
- **Status Codes:**
  - `200`: Success
  - `404`: User not found
  - `500`: Server error

### 5. Update User Details
- **URL:** `PUT /users/:id`
- **Description:** Update user profile information
- **URL Parameters:** `id` - MongoDB ObjectId of the user
- **Request Body:**
```json
{
  "name": "John Smith",
  "address": "789 Pine St, New City",
  "email": "johnsmith@example.com",
  "phone": "+1555666777"
}
```
- **Note:** Only name, address, email, and phone can be updated. Username and password cannot be changed.
- **Status Codes:**
  - `200`: User updated successfully
  - `404`: User not found
  - `500`: Server error

---

## Product Endpoints

### 1. Get All Products
- **URL:** `GET /products`
- **Description:** Retrieve all products or filter by store
- **Query Parameters:** 
  - `storeId` (optional) - MongoDB ObjectId of the store to filter by
- **Example:** `GET /products?storeId=64f123456789abcdef123456`
- **Response:** Array of product objects with populated store information
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 2. Get Products by Store
- **URL:** `GET /stores/:storeId/products`
- **Description:** Retrieve all products for a specific store
- **URL Parameters:** `storeId` - MongoDB ObjectId of the store
- **Response:** Array of product objects
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 3. Create New Product
- **URL:** `POST /products`
- **Description:** Create a new product
- **Request Body:**
```json
{
  "name": "iPhone 15",
  "price": "$999",
  "category": "Smartphones",
  "description": "Latest iPhone model with advanced features",
  "quantity": 50,
  "store": "64f123456789abcdef123456",
  "image": "https://example.com/iphone15.jpg"
}
```
- **Required Fields:** `name`, `price`, `category`, `store`
- **Features:** 
  - Automatic image compression (resized to 800x600, 80% JPEG quality)
  - Store validation
- **Status Codes:**
  - `201`: Product created successfully
  - `400`: Store not found or invalid data
  - `500`: Server error

### 4. Create Product for Specific Store
- **URL:** `POST /stores/:storeId/products`
- **Description:** Create a new product for a specific store
- **URL Parameters:** `storeId` - MongoDB ObjectId of the store
- **Request Body:** Same as above, but `store` field will be automatically set
- **Status Codes:**
  - `201`: Product created successfully
  - `404`: Store not found
  - `500`: Server error

### 5. Get Product by ID
- **URL:** `GET /products/:id`
- **Description:** Retrieve a specific product by its MongoDB ObjectId
- **URL Parameters:** `id` - MongoDB ObjectId of the product
- **Response:** Product object with populated store information
- **Status Codes:**
  - `200`: Success
  - `404`: Product not found
  - `500`: Server error

### 6. Update Product
- **URL:** `PUT /products/:id`
- **Description:** Update an existing product
- **URL Parameters:** `id` - MongoDB ObjectId of the product
- **Request Body:** Any fields to update
- **Status Codes:**
  - `200`: Product updated successfully
  - `404`: Product not found
  - `500`: Server error

### 7. Delete Product
- **URL:** `DELETE /products/:id`
- **Description:** Delete a product
- **URL Parameters:** `id` - MongoDB ObjectId of the product
- **Status Codes:**
  - `200`: Product deleted successfully
  - `404`: Product not found
  - `500`: Server error

---

## Order Endpoints

### 1. Create New Order
- **URL:** `POST /orders`
- **Description:** Create a new order
- **Request Body:**
```json
{
  "productId": "64f123456789abcdef123456",
  "storeId": "64f123456789abcdef123457",
  "userId": "64f123456789abcdef123458",
  "quantity": 2
}
```
- **Required Fields:** `productId`, `storeId`, `userId`
- **Features:** 
  - Automatic unique order ID generation
  - Validates product, store, and user existence
  - Default quantity is 1
- **Response:** Order object with populated product, store, and user data
- **Status Codes:**
  - `201`: Order created successfully
  - `400`: Required fields missing
  - `404`: Product, store, or user not found
  - `500`: Server error

### 2. Get All Orders
- **URL:** `GET /orders`
- **Description:** Retrieve all orders (admin endpoint)
- **Response:** Array of orders sorted by creation date (newest first)
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 3. Get Order by Order ID
- **URL:** `GET /orders/:orderId`
- **Description:** Retrieve a specific order by its unique order ID
- **URL Parameters:** `orderId` - Unique order ID (e.g., "ORD-1693123456789-abc123def")
- **Response:** Order object with detailed product, store, and user information
- **Status Codes:**
  - `200`: Success
  - `404`: Order not found
  - `500`: Server error

### 4. Get Orders by Store
- **URL:** `GET /stores/:storeId/orders`
- **Description:** Retrieve all orders for a specific store
- **URL Parameters:** `storeId` - MongoDB ObjectId of the store
- **Response:** Array of orders for the store, sorted by creation date
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

### 5. Get Orders by User
- **URL:** `GET /users/:userId/orders`
- **Description:** Retrieve all orders for a specific user
- **URL Parameters:** `userId` - MongoDB ObjectId of the user
- **Response:** Array of orders for the user, sorted by creation date
- **Status Codes:**
  - `200`: Success
  - `500`: Server error

---

## Data Models

### Store Model
```json
{
  "_id": "ObjectId",
  "name": "string (required)",
  "description": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "owner": "string (required)",
  "username": "string (required, unique)",
  "password": "string (required)",
  "image": "string",
  "category": "string (required)",
  "isActive": "boolean (default: true)",
  "locationLat": "string",
  "locationLng": "string",
  "createdAt": "Date (auto-generated)"
}
```

### User Model
```json
{
  "_id": "ObjectId",
  "username": "string (required, unique)",
  "password": "string (required)",
  "name": "string",
  "address": "string",
  "email": "string",
  "phone": "string",
  "createdAt": "Date (auto-generated)"
}
```

### Product Model
```json
{
  "_id": "ObjectId",
  "name": "string (required)",
  "price": "string (required)",
  "category": "string (required)",
  "image": "string",
  "imageTemp": "string (compressed base64 image)",
  "description": "string",
  "quantity": "number",
  "store": "ObjectId (required, ref: Store)",
  "createdAt": "Date (auto-generated)"
}
```

### Order Model
```json
{
  "_id": "ObjectId",
  "orderId": "string (required, unique, auto-generated)",
  "productId": "ObjectId (required, ref: Product)",
  "storeId": "ObjectId (required, ref: Store)",
  "userId": "ObjectId (required, ref: User)",
  "quantity": "number (default: 1)",
  "status": "string (default: 'pending')",
  "createdAt": "Date (auto-generated)"
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (missing required fields, invalid data)
- `404`: Resource not found
- `409`: Conflict (duplicate username)
- `500`: Internal server error

---

## Features

1. **Image Processing**: Product images are automatically compressed and converted to base64
2. **Data Validation**: Input validation for coordinates, required fields, etc.
3. **Automatic Population**: Related data is automatically populated in responses
4. **Unique Order IDs**: Orders get unique, human-readable IDs
5. **Password Security**: Passwords are never returned in API responses
6. **Cascading Deletes**: Deleting a store also deletes its products

---

## Development Notes

- The API currently uses plain text passwords (consider implementing JWT and password hashing)
- MongoDB connection string should be in `.env` file as `MONGO_URI`
- Server runs on port 5000 by default, configurable via `PORT` environment variable
- All timestamps are in UTC format
- Image compression requires `sharp` library for processing
