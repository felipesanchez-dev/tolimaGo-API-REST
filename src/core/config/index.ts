import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

interface AppConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  mongodbTestUri: string;
  auth: {
    jwtSecret: string;
    jwtRefreshSecret: string;
    jwtExpire: string;
    jwtRefreshExpire: string;
  };
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  corsOrigin: string;
  swaggerServerUrl: string;
  defaultSearchRadiusKm: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  adminEmail: string;
  adminPassword: string;
  smtpConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

// Validate required environment variables
const validateEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    logger.error(`❌ Environment variable ${name} is required but not set`);
    process.exit(1);
  }
  return value;
};

// Parse boolean environment variables
const parseBoolean = (
  value: string | undefined,
  defaultValue = false
): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Parse number environment variables
const parseNumber = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Configuration object
export const config: AppConfig = {
  port: parseNumber(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: validateEnvVar('MONGODB_URI'),
  mongodbTestUri:
    process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/tolimago_test',
  auth: {
    jwtSecret: validateEnvVar('JWT_SECRET'),
    jwtRefreshSecret: validateEnvVar('JWT_REFRESH_SECRET'),
    jwtExpire: process.env.JWT_EXPIRE || '15m',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
  rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  swaggerServerUrl:
    process.env.SWAGGER_SERVER_URL ||
    `http://localhost:${parseNumber(process.env.PORT, 3000)}`,
  defaultSearchRadiusKm: parseNumber(process.env.DEFAULT_SEARCH_RADIUS_KM, 50),
  maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 5242880), // 5MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  adminEmail: process.env.ADMIN_EMAIL || 'admin@tolimago.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'change_this_in_production',
  smtpConfig: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@tolimago.com',
    fromName: process.env.FROM_NAME || 'TOLIMAGO',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};

// Validate configuration in production
export const validateConfig = (): void => {
  if (config.nodeEnv === 'production') {
    const requiredInProd = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

    for (const envVar of requiredInProd) {
      if (!process.env[envVar]) {
        logger.error(`❌ ${envVar} is required in production`);
        process.exit(1);
      }
    }

    // Warn about default values in production
    if (config.adminPassword === 'change_this_in_production') {
      logger.warn('⚠️  Using default admin password in production!');
    }
  }

  logger.info('✅ Configuration validated successfully');
};

// Export individual config sections for easier importing
export const { port, nodeEnv, mongodbUri, auth, corsOrigin } = config;
