import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './user.routes.js';
import expenseRouter from './expenses.routes.js';
import ApiResponse from '../utils/ApiResponse.js';
import incomeRouter from './incomes.routes.js';
import dashboardRouter from './dashboard.routes.js';

const router = express.Router();

/**
 * Health check route.
 * GET /api/v1/health
 */
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  const healthData = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV,
  };

  res.status(200).json(new ApiResponse(200, healthData, 'System is healthy'));
});

// Mount other modules here
router.use('/users', userRoutes);
router.use('/user-expenses', expenseRouter);
router.use('/user-incomes', incomeRouter);
router.use('/dashboard', dashboardRouter);

export default router;
