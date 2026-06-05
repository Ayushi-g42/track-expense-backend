import mongoose from 'mongoose';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

/**
 * Express centralized error handling middleware.
 * Intercepts all errors, formats them consistently, logs details, and sends JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // If the error is not an instance of our custom ApiError, convert/wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Handle specific Mongoose/MongoDB errors for clean client messages

  // 1. Mongoose Bad ObjectID (CastError)
  if (err instanceof mongoose.Error.CastError) {
    const message = `Resource not found with invalid field: ${err.path}`;
    error = new ApiError(400, message, [], err.stack);
  }

  // 2. Mongoose Duplicate Key Error (MongoDB Code 11000)
  if (err.code === 11000) {
    const fieldName = Object.keys(err.keyValue || {})[0];
    const message = `Duplicate value entered for field: '${fieldName}'. Please use another value.`;
    error = new ApiError(409, message, [], err.stack);
  }

  // 3. Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const errorDetails = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    error = new ApiError(400, 'Database validation failed', errorDetails, err.stack);
  }

  // Extract critical values
  const { statusCode, message, errors } = error;

  // Log error using Winston
  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    // Pass the full error stack so winston formats it nicely
    error
  );

  // Define response envelope
  const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    // Include stack trace in response only during development
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
