import mongoose, { Document, Schema } from 'mongoose';
import { IBaseEntity, UserRole } from '../../../core/interfaces';

export interface IAuditLog extends IBaseEntity {
  user?: mongoose.Types.ObjectId; // Reference to User (null for system actions)
  action: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  userAgent?: string;
  ipAddress: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    fields: string[];
  };
  metadata: {
    duration?: number; // Request duration in ms
    userRole?: UserRole;
    sessionId?: string;
    requestId?: string;
    errorMessage?: string;
    stackTrace?: string;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'crud' | 'security' | 'system' | 'business' | 'payment';
}

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {
  isSensitiveAction(): boolean;
  getFormattedLog(): string;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      maxlength: [100, 'Action cannot exceed 100 characters'],
    },
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      trim: true,
      maxlength: [50, 'Resource cannot exceed 50 characters'],
    },
    resourceId: {
      type: Schema.Types.ObjectId,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      required: [true, 'HTTP method is required'],
    },
    endpoint: {
      type: String,
      required: [true, 'Endpoint is required'],
      trim: true,
    },
    statusCode: {
      type: Number,
      required: [true, 'Status code is required'],
      min: [100, 'Invalid status code'],
      max: [599, 'Invalid status code'],
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      validate: {
        validator: function(ip: string) {
          // Basic IP validation (IPv4 and IPv6)
          const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
          const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === '::1' || ip === 'localhost';
        },
        message: 'Please provide a valid IP address',
      },
    },
    changes: {
      before: {
        type: Schema.Types.Mixed,
      },
      after: {
        type: Schema.Types.Mixed,
      },
      fields: [{
        type: String,
        trim: true,
      }],
    },
    metadata: {
      duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
      },
      userRole: {
        type: String,
        enum: Object.values(UserRole),
      },
      sessionId: {
        type: String,
        trim: true,
      },
      requestId: {
        type: String,
        trim: true,
      },
      errorMessage: {
        type: String,
        trim: true,
      },
      stackTrace: {
        type: String,
        select: false, // Don't include in regular queries
      },
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['auth', 'crud', 'security', 'system', 'business', 'payment'],
      required: [true, 'Category is required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance and querying
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ ipAddress: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ category: 1 });
auditLogSchema.index({ statusCode: 1 });
auditLogSchema.index({ 'metadata.userRole': 1 });

// TTL index to auto-delete old logs (keep for 1 year)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

// Compound indexes for common queries
auditLogSchema.index({ category: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, action: 1, createdAt: -1 });

// Check if action is sensitive
auditLogSchema.methods.isSensitiveAction = function(): boolean {
  const sensitiveActions = [
    'login',
    'logout',
    'password_change',
    'password_reset',
    'email_change',
    'role_change',
    'user_delete',
    'business_verify',
    'payment_process',
    'data_export',
    'admin_access',
  ];
  
  return sensitiveActions.includes(this.action.toLowerCase());
};

// Get formatted log string
auditLogSchema.methods.getFormattedLog = function(): string {
  const timestamp = this.createdAt.toISOString();
  const userInfo = this.user ? `User:${this.user}` : 'System';
  const roleInfo = this.metadata.userRole ? `[${this.metadata.userRole}]` : '';
  
  return `[${timestamp}] ${this.severity.toUpperCase()} - ${userInfo}${roleInfo} performed "${this.action}" on ${this.resource} via ${this.method} ${this.endpoint} (${this.statusCode}) from ${this.ipAddress}`;
};

// Helper to determine category from action
const getCategoryFromAction = (action: string): string => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('login') || actionLower.includes('auth') || actionLower.includes('token')) {
    return 'auth';
  }
  if (actionLower.includes('payment') || actionLower.includes('billing')) {
    return 'payment';
  }
  if (actionLower.includes('security') || actionLower.includes('suspicious') || actionLower.includes('blocked')) {
    return 'security';
  }
  if (actionLower.includes('business') || actionLower.includes('verify')) {
    return 'business';
  }
  if (actionLower.includes('create') || actionLower.includes('update') || actionLower.includes('delete')) {
    return 'crud';
  }
  
  return 'system';
};

// Static method to log user action
auditLogSchema.statics.logUserAction = async function(
  userId: string,
  action: string,
  resource: string,
  req: any,
  statusCode = 200,
  additionalData?: Record<string, unknown>
): Promise<IAuditLogDocument> {
  const log = new this({
    user: new mongoose.Types.ObjectId(userId),
    action,
    resource,
    method: req.method,
    endpoint: req.originalUrl,
    statusCode,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
    metadata: {
      userRole: req.user?.role,
      sessionId: req.sessionID,
      requestId: req.id,
      ...additionalData,
    },
    category: getCategoryFromAction(action),
  });
  return log.save();
};

// Static method to log system action
auditLogSchema.statics.logSystemAction = async function(
  action: string,
  resource: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
  additionalData?: Record<string, unknown>
): Promise<IAuditLogDocument> {
  const log = new this({
    user: null,
    action,
    resource,
    method: 'GET',
    endpoint: '/system',
    statusCode: 200,
    ipAddress: '127.0.0.1',
    severity,
    metadata: {
      ...additionalData,
    },
    category: 'system',
  });
  return log.save();
};



export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);