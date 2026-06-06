import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';

const router = express.Router();

router
    .route('/summary')
    .get(authMiddleware, getDashboardSummary);

export default router;
