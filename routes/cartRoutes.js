const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const { protect } = require('../middleware/authMiddleware');

// All cart operations require authentication
router.use(protect);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.route('/items')
  .post(addToCart);

router.route('/items/:productId')
  .put(updateCartItemQuantity)
  .patch(updateCartItemQuantity)
  .delete(removeFromCart);

module.exports = router;
