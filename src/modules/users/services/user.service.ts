import { User } from '../models/User';
import {
  UpdateUserDto,
  GetUsersQueryDto,
  UserResponseDto,
  UsersListResponseDto,
  DeleteUserResponseDto,
} from '../dtos';
import { AppError } from '../../../core/errors/AppError';
import { logger } from '../../../core/config/logger';

export class UserService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(query: GetUsersQueryDto): Promise<UsersListResponseDto> {
    try {
      const {
        page = '1',
        limit = '10',
        search,
        role,
        city,
        isResident,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = query;

      // Parse pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filters
      const filters: any = {};

      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
        ];
      }

      if (role) filters.role = role;
      if (city) filters.city = { $regex: city, $options: 'i' };
      if (isResident !== undefined) filters.isResident = isResident === 'true';
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [users, totalUsers] = await Promise.all([
        User.find(filters)
          .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(filters),
      ]);

      // Calculate pagination
      const totalPages = Math.ceil(totalUsers / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      logger.info(`Retrieved ${users.length} users (page ${pageNum}/${totalPages})`);

      return {
        success: true,
        message: `Retrieved ${users.length} users successfully`,
        data: {
          users: users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isResident: user.isResident,
            city: user.city,
            phone: user.phone,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt || new Date(),
          })),
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalUsers,
            limit: limitNum,
            hasNextPage,
            hasPrevPage,
          },
        },
      };
    } catch (error: any) {
      logger.error(`Get users error: ${error.message}`);
      throw new AppError('Failed to retrieve users', 500);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    try {
      const user = await User.findById(userId).select(
        '-password -refreshToken -passwordResetToken -emailVerificationToken'
      );

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`Retrieved user: ${user.email}`);

      return {
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isResident: user.isResident,
            city: user.city,
            phone: user.phone,
            bio: user.bio,
            avatar: user.avatar,
            dateOfBirth: user.dateOfBirth,
            isEmailVerified: user.isEmailVerified,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
            socialLinks: user.socialLinks,
            preferences: user.preferences,
          },
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Get user by ID error: ${error.message}`);
      throw new AppError('Failed to retrieve user', 500);
    }
  }

  /**
   * Update user by ID
   */
  async updateUser(userId: string, updateData: UpdateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        throw new AppError('User not found', 404);
      }

      // If email is being updated, check if it's already taken
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) {
          throw new AppError('Email already exists', 400);
        }
      }

      // Prepare update data
      const updateFields: any = { ...updateData };

      // Handle social links
      if (updateData.facebook || updateData.instagram || updateData.twitter || updateData.website) {
        updateFields.socialLinks = {
          ...existingUser.socialLinks,
          ...(updateData.facebook && { facebook: updateData.facebook }),
          ...(updateData.instagram && { instagram: updateData.instagram }),
          ...(updateData.twitter && { twitter: updateData.twitter }),
          ...(updateData.website && { website: updateData.website }),
        };
        
        // Remove individual social fields from update
        delete updateFields.facebook;
        delete updateFields.instagram;
        delete updateFields.twitter;
        delete updateFields.website;
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true, runValidators: true }
      ).select('-password -refreshToken -passwordResetToken -emailVerificationToken');

      if (!updatedUser) {
        throw new AppError('Failed to update user', 500);
      }

      logger.info(`User updated: ${updatedUser.email}`);

      return {
        success: true,
        message: 'User updated successfully',
        data: {
          user: {
            id: updatedUser._id.toString(),
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isResident: updatedUser.isResident,
            city: updatedUser.city,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
            dateOfBirth: updatedUser.dateOfBirth,
            isEmailVerified: updatedUser.isEmailVerified,
            isActive: updatedUser.isActive,
            lastLogin: updatedUser.lastLogin,
            createdAt: updatedUser.createdAt || new Date(),
            updatedAt: updatedUser.updatedAt || new Date(),
            socialLinks: updatedUser.socialLinks,
            preferences: updatedUser.preferences,
          },
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Update user error: ${error.message}`);
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Delete user by ID (soft delete)
   */
  async deleteUser(userId: string): Promise<DeleteUserResponseDto> {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Soft delete: set isActive to false
      await User.findByIdAndUpdate(userId, {
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
      });

      logger.info(`User soft deleted: ${user.email}`);

      return {
        success: true,
        message: 'User deleted successfully',
        data: {
          deletedUserId: userId,
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Delete user error: ${error.message}`);
      throw new AppError('Failed to delete user', 500);
    }
  }
}