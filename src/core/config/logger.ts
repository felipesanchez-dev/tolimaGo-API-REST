import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define the format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define the format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  }),
];

// Add file transports only in production or if LOG_TO_FILE is enabled
if (
  process.env.NODE_ENV === 'production' ||
  process.env.LOG_TO_FILE === 'true'
) {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');

  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.errors({ stack: true }),
  transports,
  exitOnError: false,
});

// Stream for Morgan middleware
export const loggerStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

// Helper function for structured logging
export const logWithContext = (
  level: string,
  message: string,
  context?: Record<string, unknown>
): void => {
  logger.log(level, message, context);
};

// Application lifecycle logging
export const logAppStart = (port: number): void => {
  logger.info(`🚀 TOLIMAGO Backend started on port ${port}`);
  logger.info(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(
    `📄 API Documentation available at: http://localhost:${port}/docs`
  );
};

export const logAppError = (error: Error): void => {
  logger.error('💥 Application error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};
