const AppError = require('../utils/appError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Ensure we copy non-enumerable properties like statusCode and isOperational if it's an AppError instance
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  }

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId (CastError) -> 400
  if (err.name === 'CastError') {
    const message = `Invalid ID format: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key -> 409
  if (err.code === 11000) {
    const message = `Duplicate value entered for field: ${Object.keys(err.keyValue || {}).join(', ')}`;
    error = new AppError(message, 409);
  }

  // Mongoose validation error -> 400
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
