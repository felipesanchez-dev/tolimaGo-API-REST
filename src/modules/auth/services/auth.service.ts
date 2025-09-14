import { User } from '../../users/models/User';
import {
  RegisterDto,
  LoginDto,
  RegisterResponseDto,
  LoginResponseDto,
  RefreshTokenResponseDto,
  MeResponseDto,
} from '../dtos';
import { UserRole } from '../../../core/interfaces/User';
import { AppError } from '../../../core/errors/AppError';
import { config } from '../../../core/config';
import { logger } from '../../../core/config/logger';

export class AuthService {
  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: registerDto.email });
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Store password as plain text (for development)

      // Create user
      const user = await User.create({
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
        phone: registerDto.phone,
        city: registerDto.city || 'Ibagué',
        isResident: registerDto.isResident || false,
        role: registerDto.role || UserRole.USER,
        isEmailVerified: false,
        isActive: true,
        preferences: {
          language: 'es',
          currency: 'COP',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        favoriteDestinations: [],
      });

      // Generate simple tokens (for now without JWT)
      const tokens = {
        accessToken: `temp_access_${user._id.toString()}_${Date.now()}`,
        refreshToken: `temp_refresh_${user._id.toString()}_${Date.now()}`,
        expiresIn: config.auth.jwtExpire,
      };

      // Update last login
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      logger.info(`User registered successfully: ${user.email}`);

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt || new Date(),
          },
          tokens,
        },
      };
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500);
    }
  }

  /**
   * Login user
   */
  async login(
    loginDto: LoginDto,
    userAgent?: string,
    ipAddress?: string
  ): Promise<LoginResponseDto> {
    try {
      // Find user by email
      const user = await User.findOne({ email: loginDto.email }).select(
        '+password'
      );

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Account is deactivated. Contact support.', 403);
      }

      const isPasswordValid = loginDto.password === user.password;

      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate simple tokens (for now without JWT)
      const tokens = {
        accessToken: `temp_access_${user._id.toString()}_${Date.now()}`,
        refreshToken: `temp_refresh_${user._id.toString()}_${Date.now()}`,
        expiresIn: config.auth.jwtExpire,
      };

      // Update last login
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            lastLoginAt: new Date(),
          },
          tokens,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Refresh access token (simplified version)
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    try {
      // Simple token validation (extract user ID from temp token)
      const parts = refreshToken.split('_');

      if (parts.length !== 4 || parts[0] !== 'temp' || parts[1] !== 'refresh') {
        throw new AppError('Invalid refresh token', 401);
      }

      const userId = parts[2];

      // Find user
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const tokens = {
        accessToken: `temp_access_${user._id.toString()}_${Date.now()}`,
        refreshToken: `temp_refresh_${user._id.toString()}_${Date.now()}`,
        expiresIn: config.auth.jwtExpire,
      };

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Token refresh failed', 401);
    }
  }

  /**
   * Logout user (simplified)
   */
  async logout(sessionId: string): Promise<void> {
    try {
      logger.info(`User logged out, session: ${sessionId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw new AppError('Logout failed', 500);
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<MeResponseDto> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            city: user.city,
            isResident: user.isResident,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
            createdAt: user.createdAt || new Date(),
            lastLoginAt: user.lastLogin,
          },
        },
      };
    } catch (error) {
      logger.error('Get current user error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user profile', 500);
    }
  }

  /**
   * Verify token (simplified)
   */
  async verifyToken(token: string): Promise<any> {
    try {
      // Simple token validation (extract user ID from temp token)
      const parts = token.split('_');
      if (parts.length !== 4 || parts[0] !== 'temp' || parts[1] !== 'access') {
        throw new AppError('Invalid token format', 401);
      }

      const userId = parts[2];

      // Find user to validate
      const user = await User.findById(userId);
      if (!user || !user.isActive) {
        throw new AppError('Invalid token - user not found', 401);
      }

      return {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        sessionId: 'temp-session',
      };
    } catch (error) {
      logger.error('Token verification error:', error);
      throw new AppError('Invalid token', 401);
    }
  }

  /**
   * TEMPORAL: Reset user password (for debugging)
   */
  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Update password in DB (plain text)
      await User.findByIdAndUpdate(user._id, { password: newPassword });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error: any) {
      logger.error(`Reset password error: ${error.message}`);
      throw error;
    }
  }
}
