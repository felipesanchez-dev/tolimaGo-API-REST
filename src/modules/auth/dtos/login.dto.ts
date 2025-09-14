import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../core/interfaces/User';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;
}

export interface LoginResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      isEmailVerified: boolean;
      lastLoginAt: Date;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken!: string;
}

export interface RefreshTokenResponseDto {
  success: boolean;
  message: string;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}

export interface LogoutResponseDto {
  success: boolean;
  message: string;
}

export interface MeResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      city?: string;
      isResident: boolean;
      role: UserRole;
      isEmailVerified: boolean;
      avatar?: string;
      createdAt: Date;
      lastLoginAt?: Date;
    };
  };
}
