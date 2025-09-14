import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dtos';
import { AppError } from '../../../core/errors/AppError';
import { logger } from '../../../core/config/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register new user
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Transform and validate request body
      const registerDto = plainToClass(RegisterDto, req.body);
      const errors = await validate(registerDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      // Register user
      const result = await this.authService.register(registerDto);

      res.status(201).json(result);

      logger.info(`User registered via API: ${registerDto.email}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Transform and validate request body
      const loginDto = plainToClass(LoginDto, req.body);
      const errors = await validate(loginDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      // Extract user agent and IP
      const userAgent = req.get('User-Agent') || 'Unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

      // Login user
      const result = await this.authService.login(
        loginDto,
        userAgent,
        ipAddress
      );

      res.status(200).json(result);

      logger.info(`User logged in via API: ${loginDto.email}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token
   */
  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Transform and validate request body
      const refreshTokenDto = plainToClass(RefreshTokenDto, req.body);
      const errors = await validate(refreshTokenDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      // Refresh token
      const result = await this.authService.refreshToken(
        refreshTokenDto.refreshToken
      );

      res.status(200).json(result);

      logger.info('Token refreshed via API');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout current user
   */
  logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get session ID from request (set by auth middleware)
      const sessionId = (req as any).sessionId;

      if (!sessionId) {
        throw new AppError('Session not found', 401);
      }

      // Logout user
      await this.authService.logout(sessionId);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });

      logger.info(`User logged out via API, session: ${sessionId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   */
  me = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get user ID from request (set by auth middleware)
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      // Get user profile
      const result = await this.authService.getCurrentUser(userId);

      res.status(200).json(result);

      logger.info(`User profile requested via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify token (for internal use)
   */
  verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new AppError('Token not provided', 401);
      }

      const payload = await this.authService.verifyToken(token);

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: { payload },
      });
    } catch (error) {
      next(error);
    }
  };
}
