const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// @desc    Get all products (with filtering, sorting, population)
// @route   GET /api/products
exports.getProducts = asyncHandler(async (req, res, next) => {
  const queryObject = {};

  // 1. Search in name or description
  if (req.query.search) {
    queryObject.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // 2. Filter by Category
  if (req.query.category) {
    if (mongoose.Types.ObjectId.isValid(req.query.category)) {
      queryObject.category = req.query.category;
    } else {
      // Find category by name
      const cat = await Category.findOne({ name: { $regex: `^${req.query.category}$`, $options: 'i' } });
      if (cat) {
        queryObject.category = cat._id;
      } else {
        // Return 200 with empty list if category name not found
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
    }
  }

  // 3. Price limits (minPrice & maxPrice)
  if (req.query.minPrice || req.query.maxPrice) {
    queryObject.price = {};
    if (req.query.minPrice) {
      queryObject.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      queryObject.price.$lte = Number(req.query.maxPrice);
    }
  }

  // 4. inStock filter
  if (req.query.inStock !== undefined) {
    queryObject.inStock = req.query.inStock === 'true';
  }

  // Find Products in DB
  let query = Product.find(queryObject).populate('category', 'name description');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(queryObject);

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const products = await query;

  // Pagination result formatting
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError(`Product not found with id of ${req.params.id}`, 404));
  }

  const product = await Product.findById(req.params.id).populate('category', 'name description');

  if (!product) {
    return next(new AppError(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create a product
// @route   POST /api/products
exports.createProduct = asyncHandler(async (req, res, next) => {
  const { category } = req.body;
  if (!category) {
    return next(new AppError('Please add a product category', 400));
  }

  // Check if category exists in DB
  if (!mongoose.Types.ObjectId.isValid(category)) {
    return next(new AppError('Category not found', 404));
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new AppError('Category not found', 404));
  }

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Update product
// @route   PATCH /api/products/:id
exports.updateProduct = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError(`Product not found with id of ${req.params.id}`, 404));
  }

  // Validate category if present in update payload
  if (req.body.category) {
    if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
      return next(new AppError('Category not found', 404));
    }
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    return next(new AppError(`Product not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError(`Product not found with id of ${req.params.id}`, 404));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError(`Product not found with id of ${req.params.id}`, 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
