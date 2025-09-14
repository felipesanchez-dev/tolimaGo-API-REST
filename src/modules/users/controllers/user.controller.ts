import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from '../services';
import { UpdateUserDto, GetUsersQueryDto } from '../dtos';
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
}