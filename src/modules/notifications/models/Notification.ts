import mongoose, { Document, Schema } from 'mongoose';
import { NotificationType, IBaseEntity } from '../../../core/interfaces';

export interface INotification extends IBaseEntity {
  recipient: mongoose.Types.ObjectId; // Reference to User
  sender?: mongoose.Types.ObjectId; // Reference to User (system if not provided)
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>; // Additional data for the notification
  channels: {
    push: {
      sent: boolean;
      sentAt?: Date;
      deliveryStatus?: 'pending' | 'delivered' | 'failed';
      errorMessage?: string;
    };
    email: {
      sent: boolean;
      sentAt?: Date;
      deliveryStatus?: 'pending' | 'delivered' | 'failed';
      errorMessage?: string;
    };
    sms: {
      sent: boolean;
      sentAt?: Date;
      deliveryStatus?: 'pending' | 'delivered' | 'failed';
      errorMessage?: string;
    };
  };
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  actionUrl?: string; // Deep link or URL for action
  category: string;
  relatedEntity?: {
    type: 'plan' | 'booking' | 'business' | 'review' | 'user';
    id: mongoose.Types.ObjectId;
  };
  templateData?: Record<string, unknown>; // Data for template rendering
}

export interface INotificationDocument extends Omit<INotification, '_id'>, Document {
  markAsRead(): void;
  markAsSent(channel: 'push' | 'email' | 'sms', status: 'delivered' | 'failed', errorMessage?: string): void;
  isExpired(): boolean;
  shouldBeSent(channel: 'push' | 'email' | 'sms'): boolean;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    channels: {
      push: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        deliveryStatus: {
          type: String,
          enum: ['pending', 'delivered', 'failed'],
          default: 'pending',
        },
        errorMessage: String,
      },
      email: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        deliveryStatus: {
          type: String,
          enum: ['pending', 'delivered', 'failed'],
          default: 'pending',
        },
        errorMessage: String,
      },
      sms: {
        sent: {
          type: Boolean,
          default: false,
        },
        sentAt: Date,
        deliveryStatus: {
          type: String,
          enum: ['pending', 'delivered', 'failed'],
          default: 'pending',
        },
        errorMessage: String,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    expiresAt: {
      type: Date,
      validate: {
        validator: function(date: Date) {
          if (!date) return true; // Optional field
          return date > new Date();
        },
        message: 'Expiration date must be in the future',
      },
    },
    actionUrl: {
      type: String,
      validate: {
        validator: function(url: string) {
          if (!url) return true; // Optional field
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid URL',
      },
    },
    category: {
      type: String,
      required: [true, 'Notification category is required'],
      trim: true,
      lowercase: true,
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['plan', 'booking', 'business', 'review', 'user'],
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: 'relatedEntity.type',
      },
    },
    templateData: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'relatedEntity.type': 1, 'relatedEntity.id': 1 });

// TTL index to auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark notification as read
notificationSchema.methods.markAsRead = function(): void {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
};

// Mark notification as sent for a specific channel
notificationSchema.methods.markAsSent = function(
  channel: 'push' | 'email' | 'sms',
  status: 'delivered' | 'failed',
  errorMessage?: string
): void {
  this.channels[channel].sent = true;
  this.channels[channel].sentAt = new Date();
  this.channels[channel].deliveryStatus = status;
  if (errorMessage) {
    this.channels[channel].errorMessage = errorMessage;
  }
};

// Check if notification is expired
notificationSchema.methods.isExpired = function(): boolean {
  return this.expiresAt && this.expiresAt < new Date();
};

// Check if notification should be sent via channel
notificationSchema.methods.shouldBeSent = function(channel: 'push' | 'email' | 'sms'): boolean {
  return !this.channels[channel].sent && !this.isExpired();
};

// Virtual for delivery status summary
notificationSchema.virtual('deliveryStatus').get(function() {
  const channels: ('push' | 'email' | 'sms')[] = ['push', 'email', 'sms'];
  const summary = {
    total: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
  };

  channels.forEach((channel) => {
    if (this.channels[channel].sent) {
      summary.total++;
      if (this.channels[channel].deliveryStatus === 'delivered') {
        summary.delivered++;
      } else if (this.channels[channel].deliveryStatus === 'failed') {
        summary.failed++;
      } else {
        summary.pending++;
      }
    }
  });

  return summary;
});

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);