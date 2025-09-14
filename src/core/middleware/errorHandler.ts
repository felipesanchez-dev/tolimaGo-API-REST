import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';
import { config } from '../config';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

// Handle specific MongoDB/Mongoose errors
const handleMongooseError = (error: any): AppError => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
    return new AppError('Validation failed', 400, true, 'VALIDATION_ERROR', {
      errors,
    });
  }

  if (error.name === 'CastError') {
    return new AppError('Invalid ID format', 400, true, 'CAST_ERROR');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(
      `Duplicate value for field: ${field}`,
      409,
      true,
      'DUPLICATE_ERROR',
      { field }
    );
  }

  return new AppError('Database operation failed', 500, false);
};

// Handle JWT errors
const handleJWTError = (error: any): AppError => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, true, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, true, 'EXPIRED_TOKEN');
  }

  return new AppError('Authentication failed', 401, true, 'AUTH_ERROR');
};

// Send error response in development
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: {
      code: err.code,
      details: err.details,
      stack: err.stack,
    },
  });
};

// Send error response in production
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        details: err.details,
      },
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unexpected error:', err);

    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Convert known errors to AppError
  if (
    err.name === 'ValidationError' ||
    err.name === 'CastError' ||
    err.code === 11000
  ) {
    error = handleMongooseError(err);
  } else if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    error = handleJWTError(err);
  } else if (!(err instanceof AppError)) {
    error = new AppError(
      err.message || 'Something went wrong',
      err.statusCode || 500,
      false
    );
  }

  // Send error response
  if (config.nodeEnv === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Success response helper
export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
