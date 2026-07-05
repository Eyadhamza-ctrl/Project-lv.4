const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Checkout / Create order from cart
// @route   POST /api/orders
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;

  if (!shippingAddress) {
    return next(new AppError('Please provide a shipping address', 400));
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty', 400));
  }

  const orderItems = [];
  let totalAmount = 0;

  // Process items and verify stock & calculate total amount
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      return next(new AppError('One of the products in your cart has been removed', 404));
    }
    if (!product.inStock) {
      return next(new AppError(`Product ${product.name} is out of stock`, 400));
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    });

    totalAmount += product.price * item.quantity;
  }

  // Create Order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress
  });

  // Clear Cart items
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get logged in user orders (or Admin gets all orders)
// @route   GET /api/orders
exports.getOrders = asyncHandler(async (req, res, next) => {
  let query;

  // Admin sees all, users see only their own
  if (req.user.role === 'admin') {
    query = Order.find().populate('user', 'name email');
  } else {
    query = Order.find({ user: req.user._id });
  }

  const orders = await query.populate('items.product', 'name price');

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  if (!order) {
    return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
  }

  // Check if owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError(`Order not found with id of ${req.params.id}`, 404));
  }

  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();

  res.status(200).json({
    success: true,
    data: order
  });
});
