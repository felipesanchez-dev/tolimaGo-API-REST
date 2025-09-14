// Export User interfaces
export * from './User';

// Base repository interface for data access layer
export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, unknown>): Promise<T | null>;
  findMany(
    filter: Record<string, unknown>,
    options?: QueryOptions
  ): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: Record<string, unknown>): Promise<number>;
}

// Base service interface for business logic layer
export interface IBaseService<T> {
  create(data: unknown): Promise<T>;
  getById(id: string): Promise<T>;
  getMany(
    filters?: Record<string, unknown>,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;
  update(id: string, data: unknown): Promise<T>;
  delete(id: string): Promise<void>;
}

// Query options for database operations
export interface QueryOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  populate?: string | string[];
  select?: string;
}

// Paginated result interface
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Common entity fields interface
export interface IBaseEntity {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User roles enum is defined in User.ts and exported there

// Plan categories
export enum PlanCategory {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  GASTRONOMIC = 'gastronomic',
  ECOTOURISM = 'ecotourism',
  WELLNESS = 'wellness',
  FAMILY = 'family',
  BUSINESS = 'business',
}

// Booking status
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// Notification types
export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PLAN_UPDATED = 'plan_updated',
  REVIEW_RECEIVED = 'review_received',
  BUSINESS_VERIFIED = 'business_verified',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

// API Response interface (already defined in errorHandler but imported here for consistency)
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
}

// JWT Payload interface
export interface JWTPayload {
  id: string;
  email: string;
  role: string; // Use string instead to avoid circular imports
  iat?: number;
  exp?: number;
}

// File upload interface
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
