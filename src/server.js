import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';

// 1. Load Environment Variables first
dotenv.config();

let server;

// 2. Handle Uncaught Exceptions
// Catches synchronous exceptions thrown in the application that were not caught anywhere else
process.on('uncaughtException', (error) => {
  logger.error('CRITICAL: Uncaught Exception detected! Shutting down...', error);
  process.exit(1);
});

/**
 * Starts the application: connects database and binds the HTTP server port.
 */
const startServer = async () => {
  // Connect to Database
  await connectDB();

  const port = process.env.PORT || 5000;

  server = app.listen(port, () => {
    logger.info(`=================================================`);
    logger.info(`  Server running in [${process.env.NODE_ENV}] mode`);
    logger.info(`  Listening on Port: http://localhost:${port}`);
    logger.info(`=================================================`);
  });
};

startServer();

// 3. Handle Unhandled Promise Rejections
// Catches unhandled asynchronous promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error(
    'CRITICAL: Unhandled Promise Rejection detected! Gracefully shutting down...',
    reason
  );

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection closed.');
        process.exit(1);
      });
    });
  } else {
    process.exit(1);
  }
});

// 4. Graceful Shutdown handlers for System Signals (e.g. from Docker, PM2, or Heroku)
const gracefulShutdown = (signal) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection closed. Process finished.');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
