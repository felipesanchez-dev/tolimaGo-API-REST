import mongoose, { Document, Schema } from 'mongoose';
import { IBaseEntity } from '../../../core/interfaces';

export interface IBusiness extends IBaseEntity {
  name: string;
  description: string;
  logo?: string;
  images: string[];
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
    whatsapp?: string;
  };
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  legalInfo: {
    registrationNumber: string;
    taxId: string;
    type: 'company' | 'sole_proprietorship' | 'partnership' | 'corporation';
  };
  owner: mongoose.Types.ObjectId; // Reference to User
  isVerified: boolean;
  isActive: boolean;
  verificationDocuments: {
    businessLicense?: string;
    taxCertificate?: string;
    insurancePolicy?: string;
    otherDocuments: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  stats: {
    totalPlans: number;
    totalBookings: number;
    totalRevenue: number;
  };
  operatingHours: {
    monday?: { open: string; close: string; isClosed?: boolean };
    tuesday?: { open: string; close: string; isClosed?: boolean };
    wednesday?: { open: string; close: string; isClosed?: boolean };
    thursday?: { open: string; close: string; isClosed?: boolean };
    friday?: { open: string; close: string; isClosed?: boolean };
    saturday?: { open: string; close: string; isClosed?: boolean };
    sunday?: { open: string; close: string; isClosed?: boolean };
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  bankingInfo?: {
    accountNumber: string;
    accountType: string;
    bankName: string;
    accountHolder: string;
  };
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId; // Reference to Admin User
}

export interface IBusinessDocument extends Omit<IBusiness, '_id'>, Document {}

const businessSchema = new Schema<IBusinessDocument>(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
      minlength: [2, 'Business name must be at least 2 characters'],
    },
    description: {
      type: String,
      required: [true, 'Business description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    logo: {
      type: String,
      validate: {
        validator: function(url: string) {
          if (!url) return true; // Optional field
          const urlRegex = /^https?:\/\/.+/;
          return urlRegex.test(url);
        },
        message: 'Please provide a valid logo URL',
      },
    },
    images: [{
      type: String,
      validate: {
        validator: function(url: string) {
          const urlRegex = /^https?:\/\/.+/;
          return urlRegex.test(url);
        },
        message: 'Please provide valid image URLs',
      },
    }],
    contactInfo: {
      email: {
        type: String,
        required: [true, 'Business email is required'],
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
        required: [true, 'Business phone is required'],
        trim: true,
        validate: {
          validator: function(phone: string) {
            const phoneRegex = /^\+?[\d\s-()]+$/;
            return phoneRegex.test(phone);
          },
          message: 'Please provide a valid phone number',
        },
      },
      website: {
        type: String,
        validate: {
          validator: function(url: string) {
            if (!url) return true; // Optional field
            const urlRegex = /^https?:\/\/.+/;
            return urlRegex.test(url);
          },
          message: 'Please provide a valid website URL',
        },
      },
      whatsapp: {
        type: String,
        validate: {
          validator: function(phone: string) {
            if (!phone) return true; // Optional field
            const phoneRegex = /^\+?[\d\s-()]+$/;
            return phoneRegex.test(phone);
          },
          message: 'Please provide a valid WhatsApp number',
        },
      },
    },
    location: {
      address: {
        type: String,
        required: [true, 'Business address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'Business city is required'],
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
          required: [true, 'Latitude is required'],
          min: [-90, 'Invalid latitude'],
          max: [90, 'Invalid latitude'],
        },
        lng: {
          type: Number,
          required: [true, 'Longitude is required'],
          min: [-180, 'Invalid longitude'],
          max: [180, 'Invalid longitude'],
        },
      },
    },
    legalInfo: {
      registrationNumber: {
        type: String,
        required: [true, 'Business registration number is required'],
        trim: true,
        unique: true,
      },
      taxId: {
        type: String,
        required: [true, 'Tax ID is required'],
        trim: true,
        unique: true,
      },
      type: {
        type: String,
        enum: ['company', 'sole_proprietorship', 'partnership', 'corporation'],
        required: [true, 'Business type is required'],
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business owner is required'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationDocuments: {
      businessLicense: String,
      taxCertificate: String,
      insurancePolicy: String,
      otherDocuments: [String],
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
      count: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative'],
      },
    },
    stats: {
      totalPlans: {
        type: Number,
        default: 0,
        min: [0, 'Total plans cannot be negative'],
      },
      totalBookings: {
        type: Number,
        default: 0,
        min: [0, 'Total bookings cannot be negative'],
      },
      totalRevenue: {
        type: Number,
        default: 0,
        min: [0, 'Total revenue cannot be negative'],
      },
    },
    operatingHours: {
      monday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
      tuesday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
      wednesday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
      thursday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
      friday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
      saturday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
      sunday: {
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
    bankingInfo: {
      accountNumber: {
        type: String,
        select: false, // Sensitive data
      },
      accountType: {
        type: String,
        enum: ['savings', 'checking', 'business'],
        select: false,
      },
      bankName: {
        type: String,
        select: false,
      },
      accountHolder: {
        type: String,
        select: false,
      },
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
businessSchema.index({ owner: 1 });
businessSchema.index({ isVerified: 1, isActive: 1 });
businessSchema.index({ 'location.city': 1 });
businessSchema.index({ 'location.coordinates': '2dsphere' });
businessSchema.index({ 'legalInfo.registrationNumber': 1 }, { unique: true });
businessSchema.index({ 'legalInfo.taxId': 1 }, { unique: true });
businessSchema.index({ 'rating.average': -1 });
businessSchema.index({ createdAt: -1 });

// Virtual populate for plans
businessSchema.virtual('plans', {
  ref: 'Plan',
  localField: '_id',
  foreignField: 'businessInfo',
  justOne: false,
});

// Virtual populate for reviews
businessSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'business',
  justOne: false,
});

// Transform toJSON to remove sensitive data
businessSchema.methods.toJSON = function() {
  const business = this.toObject({ virtuals: true });
  delete business.bankingInfo;
  return business;
};

export const Business = mongoose.model<IBusinessDocument>('Business', businessSchema);