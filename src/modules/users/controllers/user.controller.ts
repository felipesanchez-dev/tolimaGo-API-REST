import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from '../services';
import { 
  UpdateUserDto, 
  GetUsersQueryDto, 
  ChangePasswordDto, 
  UpdatePreferencesDto, 
  AddFavoriteDto, 
  UpdateAvatarDto 
} from '../dtos';
import { AppError } from '../../../core/errors/AppError';
import { logger } from '../../../core/config/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users with pagination and filters
   */
  getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Transform and validate query parameters
      const queryDto = plainToClass(GetUsersQueryDto, req.query);
      const errors = await validate(queryDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      const result = await this.userService.getUsers(queryDto);
      res.status(200).json(result);

      logger.info('Users retrieved via API');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('User ID is required', 400);
      }

      const result = await this.userService.getUserById(id);
      res.status(200).json(result);

      logger.info(`User retrieved via API: ${id}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user by ID
   */
  updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('User ID is required', 400);
      }

      // Transform and validate request body
      const updateUserDto = plainToClass(UpdateUserDto, req.body);
      const errors = await validate(updateUserDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      const result = await this.userService.updateUser(id, updateUserDto);
      res.status(200).json(result);

      logger.info(`User updated via API: ${id}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user by ID (soft delete)
   */
  deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('User ID is required', 400);
      }

      const result = await this.userService.deleteUser(id);
      res.status(200).json(result);

      logger.info(`User deleted via API: ${id}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change user password
   */
  changePassword = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.params.id;

      // Transform and validate request body
      const changePasswordDto = plainToClass(ChangePasswordDto, req.body);
      const errors = await validate(changePasswordDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      // Check if passwords match
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        throw new AppError('New password and confirmation do not match', 400);
      }

      const result = await this.userService.changePassword(
        userId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword
      );

      res.status(200).json(result);
      logger.info(`Password changed via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user preferences
   */
  updatePreferences = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.params.id;

      // Transform and validate request body
      const preferencesDto = plainToClass(UpdatePreferencesDto, req.body);
      const errors = await validate(preferencesDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      const result = await this.userService.updatePreferences(userId, preferencesDto);
      res.status(200).json(result);

      logger.info(`Preferences updated via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add destination to favorites
   */
  addFavorite = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      // Transform and validate request body
      const addFavoriteDto = plainToClass(AddFavoriteDto, req.body);
      const errors = await validate(addFavoriteDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      const result = await this.userService.addFavorite(
        userId,
        addFavoriteDto.destinationId,
        addFavoriteDto.destinationType,
        addFavoriteDto.notes
      );

      res.status(201).json(result);
      logger.info(`Favorite added via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove destination from favorites
   */
  removeFavorite = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { destinationId } = req.params;

      if (!destinationId) {
        throw new AppError('Destination ID is required', 400);
      }

      const result = await this.userService.removeFavorite(userId, destinationId);
      res.status(200).json(result);

      logger.info(`Favorite removed via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user favorites
   */
  getFavorites = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const result = await this.userService.getFavorites(userId);
      
      res.status(200).json(result);
      logger.info(`Favorites retrieved via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user avatar
   */
  updateAvatar = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      // Transform and validate request body
      const avatarDto = plainToClass(UpdateAvatarDto, req.body);
      const errors = await validate(avatarDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        throw new AppError(`Validation failed: ${errorMessages}`, 400);
      }

      const result = await this.userService.updateAvatar(userId, avatarDto.avatar);
      res.status(200).json(result);

      logger.info(`Avatar updated via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user statistics
   */
  getUserStats = async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || req.params.id;
      const result = await this.userService.getUserStats(userId);
      
      res.status(200).json(result);
      logger.info(`User stats retrieved via API: ${userId}`);
    } catch (error) {
      next(error);
    }
  };
}