import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../config/logger';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting middleware
export const createRateLimiter = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || config.rateLimitWindowMs,
    max: max || config.rateLimitMaxRequests,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
      });

      res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
        },
      });
    },
  });
};

// Strict rate limiter for sensitive endpoints (auth, etc.)
export const strictRateLimiter = createRateLimiter(900000, 5); // 5 requests per 15 minutes

// Standard rate limiter
export const standardRateLimiter = createRateLimiter();

// Data sanitization middleware
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`Sanitized input detected`, {
      ip: req.ip,
      key,
      url: req.originalUrl,
    });
  },
});

// Request size limiter
export const requestSizeLimit = (limit: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // This would typically be handled by body-parser middleware
    // We'll add a check for content-length header
    const contentLength = req.get('content-length');
    if (contentLength) {
      const sizeLimit = parseInt(limit.replace('mb', '')) * 1024 * 1024;
      if (parseInt(contentLength) > sizeLimit) {
        res.status(413).json({
          success: false,
          message: 'Request entity too large',
          error: {
            code: 'PAYLOAD_TOO_LARGE',
          },
        });
        return;
      }
    }
    next();
  };
};

// Security logging middleware
export const securityLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript protocol
  ];

  const userAgent = req.get('User-Agent') || '';
  const url = req.originalUrl;
  const body = JSON.stringify(req.body);

  const isSuspicious = suspiciousPatterns.some(
    (pattern) =>
      pattern.test(url) || pattern.test(body) || pattern.test(userAgent)
  );

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      userAgent,
      url,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

// CORS configuration
export const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (config.corsOrigin === '*') {
      return callback(null, true);
    }

    const allowedOrigins = config.corsOrigin.split(',');
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
};
