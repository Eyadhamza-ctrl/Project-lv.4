require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// Import Custom Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Import Error Middleware
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');

const app = express();

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(express.json());

// mongoSanitize (Before routes)
app.use(mongoSanitize());

// Mount Routing Files (both singular & plural variations for maximum compatibility/resilience)
app.use('/api/products', productRoutes);
app.use('/api/product', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order', orderRoutes);

// 404 Handler using app.use to avoid path-to-regexp issues
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
