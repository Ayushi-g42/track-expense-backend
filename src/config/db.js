import mongoose from 'mongoose';
import logger from './logger.js';

/**
 * Establish a connection to MongoDB using Mongoose.
 * Sets up connection event listeners for robustness and visibility.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    logger.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  // Configure mongoose options if necessary
  const options = {
    autoIndex: true, // Build indexes (disable in high-load production environments)
  };

  // Mongoose connection event listeners
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB database connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error occurred: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB database connection was disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB database reconnected successfully.');
  });

  try {
    logger.info('Initiating connection to MongoDB...');
    await mongoose.connect(mongoURI, options);
  } catch (error) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
