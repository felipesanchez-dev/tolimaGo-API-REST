import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config, validateConfig } from './core/config';
import { dbConnection } from './core/config/database';
import {
  logger,
  loggerStream,
  logAppStart,
  logAppError,
} from './core/config/logger';
import {
  globalErrorHandler,
  notFoundHandler,
} from './core/middleware/errorHandler';
import {
  securityHeaders,
  standardRateLimiter,
  sanitizeInput,
  requestSizeLimit,
  securityLogger,
  corsConfig,
  reactNativeCorsHandler,
} from './core/middleware/security';
import { authRoutes } from './modules/auth/routes/auth.routes';
import { userRoutes } from './modules/users/routes';

class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.validateEnvironment();
    this.connectDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private validateEnvironment(): void {
    try {
      validateConfig();
    } catch (error) {
      logAppError(error as Error);
      process.exit(1);
    }
  }

  private async connectDatabase(): Promise<void> {
    try {
      await dbConnection.connect();
    } catch (error) {
      logAppError(error as Error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // React Native specific CORS handler - Must be first
    this.app.use(reactNativeCorsHandler);

    // Standard CORS middleware
    this.app.use(cors(corsConfig));

    // Handle preflight requests explicitly
    this.app.options('*', cors(corsConfig));

    // Security middlewares (relaxed for development)
    this.app.use(securityHeaders);
    this.app.use(securityLogger);
    this.app.use(standardRateLimiter);
    this.app.use(sanitizeInput);
    this.app.use(requestSizeLimit('10mb'));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (config.nodeEnv !== 'test') {
      this.app.use(
        morgan('combined', {
          stream: loggerStream,
          skip: (req) => req.originalUrl === '/health',
        })
      );
    }

    // Health check endpoint (before authentication)
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'TOLIMAGO Backend is healthy',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        database: dbConnection.getConnectionStatus()
          ? 'connected'
          : 'disconnected',
      });
    });
  }

  private initializeRoutes(): void {
    // API base route
    this.app.get('/api/v1', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Welcome to TOLIMAGO API v1',
        version: '1.0.0',
        documentation: `${config.swaggerServerUrl}/docs`,
        endpoints: {
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          plans: '/api/v1/plans',
          business: '/api/v1/business',
          bookings: '/api/v1/bookings',
          reviews: '/api/v1/reviews',
          notifications: '/api/v1/notifications',
          admin: '/api/v1/admin',
        },
      });
    });

    // Authentication routes
    this.app.use('/api/v1/auth', authRoutes);

    // User routes
    this.app.use('/api/v1/users', userRoutes);
    // this.app.use('/api/v1/plans', planRoutes);
    // this.app.use('/api/v1/business', businessRoutes);
    // this.app.use('/api/v1/bookings', bookingRoutes);
    // this.app.use('/api/v1/reviews', reviewRoutes);
    // this.app.use('/api/v1/notifications', notificationRoutes);
    // this.app.use('/api/v1/admin', adminRoutes);

    logger.info('✅ Routes initialized');
  }

  private initializeErrorHandling(): void {
    // Handle 404 errors
    this.app.use(notFoundHandler);

    // Global error handling middleware (must be last)
    this.app.use(globalErrorHandler);

    logger.info('✅ Error handling initialized');
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      logAppStart(config.port);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled Promise Rejection:', err);
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  }
}

export default App;
