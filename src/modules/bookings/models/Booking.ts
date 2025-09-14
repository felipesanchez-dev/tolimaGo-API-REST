import mongoose, { Document, Schema } from 'mongoose';
import { BookingStatus, IBaseEntity } from '../../../core/interfaces';

export interface IBooking extends IBaseEntity {
  plan: mongoose.Types.ObjectId; // Reference to Plan
  user: mongoose.Types.ObjectId; // Reference to User (customer)
  business: mongoose.Types.ObjectId; // Reference to Business
  bookingDetails: {
    dateRequested: Date;
    timeSlot: {
      start: string;
      end: string;
    };
    guests: {
      adults: number;
      children: number;
      infants: number;
    };
    totalGuests: number;
  };
  pricing: {
    subtotal: number;
    taxes: number;
    fees: number;
    discounts: number;
    total: number;
    currency: string;
  };
  status: BookingStatus;
  paymentInfo: {
    method: 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'paypal' | 'mercadopago';
    transactionId?: string;
    paidAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    specialRequests?: string;
    dietaryRestrictions?: string[];
    medicalConditions?: string;
  };
  statusHistory: {
    status: BookingStatus;
    updatedAt: Date;
    updatedBy: mongoose.Types.ObjectId; // Reference to User
    notes?: string;
  }[];
  confirmationCode: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId; // Reference to User
  completedAt?: Date;
  review?: mongoose.Types.ObjectId; // Reference to Review
  communications: {
    type: 'email' | 'sms' | 'whatsapp' | 'system';
    message: string;
    sentAt: Date;
    sentBy: mongoose.Types.ObjectId;
  }[];
  metadata: {
    source: 'web' | 'mobile' | 'admin' | 'api';
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface IBookingDocument extends Omit<IBooking, '_id'>, Document {
  generateConfirmationCode(): string;
  calculateTotal(): number;
  canBeCancelled(): boolean;
  canBeModified(): boolean;
  addStatusUpdate(status: BookingStatus, updatedBy: string, notes?: string): void;
}

const bookingSchema = new Schema<IBookingDocument>(
  {
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'Plan',
      required: [true, 'Plan is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business is required'],
    },
    bookingDetails: {
      dateRequested: {
        type: Date,
        required: [true, 'Booking date is required'],
        validate: {
          validator: function(date: Date) {
            return date >= new Date();
          },
          message: 'Booking date cannot be in the past',
        },
      },
      timeSlot: {
        start: {
          type: String,
          required: [true, 'Start time is required'],
          validate: {
            validator: function(time: string) {
              return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
            },
            message: 'Time must be in HH:MM format',
          },
        },
        end: {
          type: String,
          required: [true, 'End time is required'],
          validate: {
            validator: function(time: string) {
              return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
            },
            message: 'Time must be in HH:MM format',
          },
        },
      },
      guests: {
        adults: {
          type: Number,
          required: [true, 'Number of adults is required'],
          min: [1, 'At least 1 adult is required'],
        },
        children: {
          type: Number,
          default: 0,
          min: [0, 'Number of children cannot be negative'],
        },
        infants: {
          type: Number,
          default: 0,
          min: [0, 'Number of infants cannot be negative'],
        },
      },
      totalGuests: {
        type: Number,
        required: [true, 'Total guests is required'],
        min: [1, 'At least 1 guest is required'],
      },
    },
    pricing: {
      subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative'],
      },
      taxes: {
        type: Number,
        default: 0,
        min: [0, 'Taxes cannot be negative'],
      },
      fees: {
        type: Number,
        default: 0,
        min: [0, 'Fees cannot be negative'],
      },
      discounts: {
        type: Number,
        default: 0,
        min: [0, 'Discounts cannot be negative'],
      },
      total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative'],
      },
      currency: {
        type: String,
        enum: ['COP', 'USD'],
        default: 'COP',
      },
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'cash', 'transfer', 'paypal', 'mercadopago'],
        required: [true, 'Payment method is required'],
      },
      transactionId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
      },
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Customer email is required'],
        lowercase: true,
        trim: true,
        validate: {
          validator: function(email: string) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
          },
          message: 'Please provide a valid email address',
        },
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
      },
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
      },
      specialRequests: String,
      dietaryRestrictions: [String],
      medicalConditions: String,
    },
    statusHistory: [{
      status: {
        type: String,
        enum: Object.values(BookingStatus),
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      notes: String,
    }],
    confirmationCode: {
      type: String,
      unique: true,
      required: [true, 'Confirmation code is required'],
    },
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedAt: Date,
    review: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
    communications: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'whatsapp', 'system'],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
      sentBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    }],
    metadata: {
      source: {
        type: String,
        enum: ['web', 'mobile', 'admin', 'api'],
        default: 'web',
      },
      userAgent: String,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
bookingSchema.index({ plan: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ business: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'bookingDetails.dateRequested': 1 });
bookingSchema.index({ confirmationCode: 1 }, { unique: true });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'paymentInfo.transactionId': 1 });

// Calculate total guests before saving
bookingSchema.pre('save', function(next) {
  this.bookingDetails.totalGuests = 
    this.bookingDetails.guests.adults + 
    this.bookingDetails.guests.children + 
    this.bookingDetails.guests.infants;
  
  // Generate confirmation code if not provided
  if (!this.confirmationCode) {
    this.confirmationCode = this.generateConfirmationCode();
  }
  
  // Add status to history if status changed
  if (this.isModified('status')) {
    this.addStatusUpdate(this.status, this.user.toString());
  }
  
  next();
});

// Generate confirmation code
bookingSchema.methods.generateConfirmationCode = function(): string {
  const prefix = 'TOL';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Calculate total price
bookingSchema.methods.calculateTotal = function(): number {
  return this.pricing.subtotal + this.pricing.taxes + this.pricing.fees - this.pricing.discounts;
};

// Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function(): boolean {
  const cancellableStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
  const now = new Date();
  const bookingDate = new Date(this.bookingDetails.dateRequested);
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return cancellableStatuses.includes(this.status) && hoursUntilBooking > 24;
};

// Check if booking can be modified
bookingSchema.methods.canBeModified = function(): boolean {
  const modifiableStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
  const now = new Date();
  const bookingDate = new Date(this.bookingDetails.dateRequested);
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return modifiableStatuses.includes(this.status) && hoursUntilBooking > 48;
};

// Add status update to history
bookingSchema.methods.addStatusUpdate = function(
  status: BookingStatus, 
  updatedBy: string, 
  notes?: string
): void {
  this.statusHistory.push({
    status,
    updatedAt: new Date(),
    updatedBy: new mongoose.Types.ObjectId(updatedBy),
    notes,
  });
};

export const Booking = mongoose.model<IBookingDocument>('Booking', bookingSchema);