const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');

// Helper to populate and return cart
const getPopulatedCart = async (userId) => {
  return await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price category inStock description'
  });
};

// @desc    Get user's shopping cart
// @route   GET /api/cart
exports.getCart = asyncHandler(async (req, res, next) => {
  let cart = await getPopulatedCart(req.user._id);

  // If cart doesn't exist, create an empty one
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart/items
exports.addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  if (qty < 1) {
    return next(new AppError('Quantity must be at least 1 to add product', 400));
  }

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check product stock status
  if (!product.inStock) {
    return next(new AppError('Product is out of stock', 400));
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
  }

  // Check if product is already in the cart to verify stock sum
  const existingItem = cart.items.find(item => item.product.toString() === productId);
  const newQty = existingItem ? existingItem.quantity + qty : qty;

  if (product.stock < newQty) {
    return next(new AppError('Not enough stock available', 400));
  }

  // Upsert or increase quantity
  if (existingItem) {
    existingItem.quantity = newQty;
    existingItem.price = product.price; // Price comes from database
  } else {
    cart.items.push({
      product: productId,
      quantity: qty,
      price: product.price // Price comes from database
    });
  }

  // Update totalPrice
  cart.totalPrice = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

  await cart.save();

  const populatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedCart
  });
});

// @desc    Update cart item quantity
// @route   PATCH /api/cart/items/:productId
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  const qty = Number(quantity);

  if (isNaN(qty) || qty < 0) {
    return next(new AppError('No negative quantity allowed', 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(item => item.product.toString() === req.params.productId);

  if (qty === 0) {
    // If quantity reaches 0 -> item removed automatically
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
    }
  } else {
    if (itemIndex === -1) {
      return next(new AppError('Product not found in cart', 404));
    }

    // Check stock for the desired quantity
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.stock < qty) {
      return next(new AppError('Not enough stock available', 400));
    }

    cart.items[itemIndex].quantity = qty;
    cart.items[itemIndex].price = product.price; // Price comes from database
  }

  // Update totalPrice
  cart.totalPrice = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

  await cart.save();

  const populatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedCart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);

  // Update totalPrice
  cart.totalPrice = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

  await cart.save();

  const populatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    data: populatedCart
  });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
exports.clearCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
  } else {
    cart = await Cart.create({ user: req.user._id, items: [], totalPrice: 0 });
  }

  res.status(200).json({
    success: true,
    data: cart
  });
});
