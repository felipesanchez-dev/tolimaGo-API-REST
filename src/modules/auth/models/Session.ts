import mongoose, { Document, Schema } from 'mongoose';
import { IBaseEntity } from '../../../core/interfaces';

export interface ISession extends IBaseEntity {
  user: mongoose.Types.ObjectId; // Reference to User
  refreshToken: string;
  accessToken: string;
  isActive: boolean;
  expiresAt: Date;
  deviceInfo: {
    userAgent?: string;
    browser?: string;
    os?: string;
    device?: string;
    isMobile: boolean;
  };
  location: {
    ipAddress: string;
    country?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  lastAccessedAt: Date;
  revokedAt?: Date;
  revokedBy?: mongoose.Types.ObjectId; // Reference to User (admin who revoked)
  revokeReason?: string;
}

export interface ISessionDocument extends Omit<ISession, '_id'>, Document {
  isExpired(): boolean;
  revoke(revokedBy?: string, reason?: string): void;
  updateLastAccessed(): void;
  generateTokens(): { accessToken: string; refreshToken: string };
}

const sessionSchema = new Schema<ISessionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
      unique: true,
      select: false, // Don't include in regular queries for security
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required'],
      select: false, // Don't include in regular queries for security
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
    deviceInfo: {
      userAgent: String,
      browser: String,
      os: String,
      device: String,
      isMobile: {
        type: Boolean,
        default: false,
      },
    },
    location: {
      ipAddress: {
        type: String,
        required: [true, 'IP address is required'],
      },
      country: String,
      city: String,
      coordinates: {
        lat: {
          type: Number,
          min: [-90, 'Invalid latitude'],
          max: [90, 'Invalid latitude'],
        },
        lng: {
          type: Number,
          min: [-180, 'Invalid longitude'],
          max: [180, 'Invalid longitude'],
        },
      },
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: Date,
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    revokeReason: {
      type: String,
      enum: [
        'user_logout',
        'admin_revoke',
        'security_breach',
        'suspicious_activity',
        'password_change',
        'account_deactivation',
        'multiple_sessions',
        'expired',
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ refreshToken: 1 }, { unique: true });
sessionSchema.index({ 'location.ipAddress': 1 });
sessionSchema.index({ lastAccessedAt: -1 });
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ expiresAt: 1 });

// Check if session is expired
sessionSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date() || !this.isActive;
};

// Revoke session
sessionSchema.methods.revoke = function (
  revokedBy?: string,
  reason?: string
): void {
  this.isActive = false;
  this.revokedAt = new Date();
  if (revokedBy) {
    this.revokedBy = new mongoose.Types.ObjectId(revokedBy);
  }
  if (reason) {
    this.revokeReason = reason as any;
  }
};

// Update last accessed timestamp
sessionSchema.methods.updateLastAccessed = function (): void {
  this.lastAccessedAt = new Date();
};

// Generate new tokens (placeholder - actual implementation would use JWT)
sessionSchema.methods.generateTokens = function (): {
  accessToken: string;
  refreshToken: string;
} {
  // This is a placeholder - real implementation would generate JWT tokens
  const accessToken = `access_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const refreshToken = `refresh_${Date.now()}_${Math.random().toString(36).substring(2)}`;

  this.accessToken = accessToken;
  this.refreshToken = refreshToken;

  return { accessToken, refreshToken };
};

// Parse user agent to extract device info
sessionSchema.pre('save', function (next) {
  if (this.isNew && this.deviceInfo.userAgent) {
    // Simple user agent parsing (in production, use a proper library like 'ua-parser-js')
    const ua = this.deviceInfo.userAgent.toLowerCase();

    // Detect mobile
    this.deviceInfo.isMobile = /mobile|android|iphone|ipad|phone/i.test(ua);

    // Detect browser
    if (ua.includes('chrome')) this.deviceInfo.browser = 'Chrome';
    else if (ua.includes('firefox')) this.deviceInfo.browser = 'Firefox';
    else if (ua.includes('safari')) this.deviceInfo.browser = 'Safari';
    else if (ua.includes('edge')) this.deviceInfo.browser = 'Edge';
    else this.deviceInfo.browser = 'Unknown';

    // Detect OS
    if (ua.includes('windows')) this.deviceInfo.os = 'Windows';
    else if (ua.includes('macintosh')) this.deviceInfo.os = 'macOS';
    else if (ua.includes('linux')) this.deviceInfo.os = 'Linux';
    else if (ua.includes('android')) this.deviceInfo.os = 'Android';
    else if (ua.includes('ios')) this.deviceInfo.os = 'iOS';
    else this.deviceInfo.os = 'Unknown';
  }

  next();
});

// Static method to find active session by refresh token
sessionSchema.statics.findActiveByRefreshToken = async function (
  refreshToken: string
): Promise<ISessionDocument | null> {
  return this.findOne({
    refreshToken,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).populate('user', 'name email role isActive');
};

// Static method to revoke all user sessions
sessionSchema.statics.revokeAllUserSessions = async function (
  userId: string,
  revokedBy?: string,
  reason = 'security_revoke'
): Promise<number> {
  const result = await this.updateMany(
    {
      user: new mongoose.Types.ObjectId(userId),
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: revokedBy
          ? new mongoose.Types.ObjectId(revokedBy)
          : undefined,
        revokeReason: reason,
      },
    }
  );

  return result.modifiedCount;
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = async function (): Promise<number> {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      {
        isActive: false,
        revokedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }, // 30 days old
    ],
  });

  return result.deletedCount;
};

// Virtual for session status
sessionSchema.virtual('status').get(function () {
  if (!this.isActive) return 'revoked';
  if (this.isExpired()) return 'expired';
  return 'active';
});

// Transform toJSON to hide sensitive data
sessionSchema.methods.toJSON = function () {
  const session = this.toObject({ virtuals: true });
  delete session.refreshToken;
  delete session.accessToken;
  return session;
};

export const Session = mongoose.model<ISessionDocument>(
  'Session',
  sessionSchema
);
