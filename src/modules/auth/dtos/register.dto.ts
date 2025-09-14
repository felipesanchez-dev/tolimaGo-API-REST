import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../core/interfaces/User';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  password!: string;

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
  isResident?: boolean = false;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole = UserRole.USER;
}

export interface RegisterResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      isEmailVerified: boolean;
      createdAt: Date;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}
