import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from '../../infrastructure/db/mongoose/dbConnect';
import authRoutes from './routes/auth/auth.route';

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

// Sanitization to prevent NoSQL injection
app.use(mongoSanitize());

// Inline cookie parsing middleware to extract refresh token
app.use((req: any, _res: Response, next: NextFunction) => {
  const cookies: { [key: string]: string } = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const [name, ...valueParts] = cookie.split('=');
      if (name && valueParts.length > 0) {
        cookies[name.trim()] = decodeURIComponent(valueParts.join('='));
      }
    });
  }
  req.cookies = cookies;
  next();
});

// Logging HTTP Requests
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Liveness Check
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Readiness Check
app.get('/readyz', async (_req: Request, res: Response) => {
  const mongoose = require('mongoose');
  const isMongoReady = mongoose.connection.readyState === 1;

  if (isMongoReady) {
    return res.status(200).json({ status: 'ready', mongo: 'connected' });
  } else {
    return res.status(503).json({ status: 'unready', mongo: 'disconnected' });
  }
});

// Routing
app.use('/api/v1/auth', authRoutes);


// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
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
