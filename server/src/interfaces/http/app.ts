import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from '../../infrastructure/db/mongoose/dbConnect';
import cookieParser from "cookie-parser";

import healthzRoute from './routes/healthz/healthz.route';
import authRoute from './routes/auth/auth.route';

import { logger } from '../../infrastructure/logging/logger';
import { ENV } from '../../config/env';

const app = express();
const PORT = ENV.PORT || 3000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "wss://collaboration.enterprise.com", "ws://localhost:1234", "ws://127.0.0.1:1234"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: true, // Allow all origins for dev simplicity, can restrict in prod
  credentials: true
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitization to prevent NoSQL injection
app.use(mongoSanitize());

// Cookie parsing middleware
app.use(cookieParser());

// Logging HTTP Requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Liveness Check
app.get('/', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Routes
app.use('/api/v1', healthzRoute);
app.use("/api/v1/auth", authRoute);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  // 1. Handle Known Operational Errors (Validation failures, 400s, 401s, 404s, etc.)
  if (isOperational) {
    logger.warn({
      statusCode,
      message: err.message,
      errors: err.errors,
    }, `Operational Error [${statusCode}]: ${err.message}`);

    return res.status(statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
      data: err.data || null,
    });
  }

  // 2. Handle Unexpected Internal System Errors (500s)
  logger.error(
    {
      err,
      stack: err.stack,
    },
    "Unhandled server error",
  );

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// Start Server if not imported for testing
if (ENV.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      logger.info(`Express REST Server running on port ${PORT}`);
    });
  });
}

export { app };
