import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../core/interfaces/User';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number cannot exceed 20 characters' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsBoolean()
  isResident?: boolean;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date' })
  dateOfBirth?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  avatar?: string;

  // Social Links
  @IsOptional()
  @IsUrl({}, { message: 'Facebook URL is not valid' })
  facebook?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Instagram URL is not valid' })
  instagram?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Twitter URL is not valid' })
  twitter?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website URL is not valid' })
  website?: string;
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  page?: string = '1';

  @IsOptional()
  @IsString()
  limit?: string = '10';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role filter' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  isResident?: string;

  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';
}

// Response DTOs
export interface UserResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      isResident: boolean;
      city: string;
      phone?: string;
      bio?: string;
      avatar?: string;
      dateOfBirth?: Date;
      isEmailVerified: boolean;
      isActive: boolean;
      lastLogin?: Date;
      createdAt: Date;
      updatedAt: Date;
      socialLinks?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        website?: string;
      };
      preferences: {
        language: string;
        currency: string;
        notifications: {
          email: boolean;
          push: boolean;
          sms: boolean;
        };
      };
    };
  };
}

export interface UsersListResponseDto {
  success: boolean;
  message: string;
  data: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: UserRole;
      isResident: boolean;
      city: string;
      phone?: string;
      avatar?: string;
      isEmailVerified: boolean;
      isActive: boolean;
      lastLogin?: Date;
      createdAt: Date;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface DeleteUserResponseDto {
  success: boolean;
  message: string;
  data: {
    deletedUserId: string;
  };
}

// Password Management DTOs
export class ChangePasswordDto {
  @IsString()
  @MinLength(3, { message: 'Current password is required' })
  currentPassword!: string;

  @IsString()
  @MinLength(3, { message: 'New password must be at least 3 characters' })
  newPassword!: string;

  @IsString()
  @MinLength(3, { message: 'Password confirmation is required' })
  confirmPassword!: string;
}

// Preferences DTOs
export class UpdatePreferencesDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;
}

// Favorites DTOs
export class AddFavoriteDto {
  @IsString()
  @MinLength(1, { message: 'Destination ID is required' })
  destinationId!: string;

  @IsOptional()
  @IsString()
  destinationType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// Avatar DTO
export class UpdateAvatarDto {
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  avatar!: string;
}

// Response DTOs
export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
}

export interface UpdatePreferencesResponseDto {
  success: boolean;
  message: string;
  data: {
    preferences: {
      language: string;
      currency: string;
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
    };
  };
}

export interface FavoritesResponseDto {
  success: boolean;
  message: string;
  data: {
    favorites: Array<{
      id: string;
      destinationId: string;
      destinationType: string;
      notes?: string;
      addedAt: Date;
    }>;
  };
}

export interface UserStatsResponseDto {
  success: boolean;
  message: string;
  data: {
    stats: {
      totalBookings: number;
      totalReviews: number;
      favoritesCount: number;
      memberSince: Date;
      lastActivity: Date;
      planningHistory: number;
    };
  };
}