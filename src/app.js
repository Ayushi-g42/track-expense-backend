import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import ApiError from './utils/ApiError.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigin = process.env.CORS_ORIGIN || '*';
      if (allowedOrigin === '*' || !origin) return callback(null, true);
      
      const allowedOrigins = allowedOrigin.split(',');
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body Parser (limit payload size to prevent DOS attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. IP Rate Limiting
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000;
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all routes under /api
app.use('/api', limiter);

// 5. API Routes
app.use('/api/v1', routes);

// Serve static files
app.use('/public', express.static('public'));

// 6. Global 404 Handler (For unmatched routes)
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// 7. Centralized Error Handler Middleware
// Must be registered last
app.use(errorHandler);

export default app;

