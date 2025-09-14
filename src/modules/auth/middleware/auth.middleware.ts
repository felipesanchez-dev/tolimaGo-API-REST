import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../../core/interfaces/User';
import { AppError } from '../../../core/errors/AppError';
import { logger } from '../../../core/config/logger';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: UserRole;
      sessionId?: string;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware to verify JWT token
   */
  authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authorization token is required', 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        throw new AppError('Authorization token is required', 401);
      }

      // Verify token
      const payload = await this.authService.verifyToken(token);

      // Attach user data to request
      req.userId = payload.userId;
      req.userEmail = payload.email;
      req.userRole = payload.role;
      req.sessionId = payload.sessionId;

      next();
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      next(error);
    }
  };

  /**
   * Middleware to check user roles
   */
  authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.userRole) {
          throw new AppError('User role not found', 401);
        }

        if (!allowedRoles.includes(req.userRole)) {
          throw new AppError('Insufficient permissions', 403);
        }

        next();
      } catch (error) {
        logger.error('Authorization middleware error:', error);
        next(error);
      }
    };
  };

  /**
   * Middleware to check if user is admin
   */
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.userRole) {
        throw new AppError('User role not found', 401);
      }

      if (
        req.userRole !== UserRole.ADMIN &&
        req.userRole !== UserRole.SUPER_ADMIN
      ) {
        throw new AppError('Admin access required', 403);
      }

      next();
    } catch (error) {
      logger.error('Admin authorization error:', error);
      next(error);
    }
  };

  /**
   * Middleware to check if user is business owner
   */
  requireBusinessOwner = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.userRole) {
        throw new AppError('User role not found', 401);
      }

      const allowedRoles = [
        UserRole.BUSINESS_OWNER,
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
      ];

      if (!allowedRoles.includes(req.userRole)) {
        throw new AppError('Business owner access required', 403);
      }

      next();
    } catch (error) {
      logger.error('Business owner authorization error:', error);
      next(error);
    }
  };

  /**
   * Optional authentication middleware - doesn't fail if no token
   */
  optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        if (token) {
          try {
            const payload = await this.authService.verifyToken(token);

            // Attach user data to request
            req.userId = payload.userId;
            req.userEmail = payload.email;
            req.userRole = payload.role;
            req.sessionId = payload.sessionId;
          } catch (error) {
            // Don't throw error for optional auth, just log it
            logger.warn('Optional authentication failed:', error);
          }
        }
      }

      next();
    } catch (error) {
      logger.error('Optional auth middleware error:', error);
      next();
    }
  };

  /**
   * Middleware to check if user owns the resource
   */
  requireOwnership = (userIdParam = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const resourceUserId = req.params[userIdParam];
        const currentUserId = req.userId;

        if (!currentUserId) {
          throw new AppError('User not authenticated', 401);
        }

        // Admin and super admin can access any resource
        if (
          req.userRole === UserRole.ADMIN ||
          req.userRole === UserRole.SUPER_ADMIN
        ) {
          return next();
        }

        // User can only access their own resources
        if (currentUserId !== resourceUserId) {
          throw new AppError(
            'Access denied: You can only access your own resources',
            403
          );
        }

        next();
      } catch (error) {
        logger.error('Ownership authorization error:', error);
        next(error);
      }
    };
  };
}
