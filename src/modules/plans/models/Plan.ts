import mongoose, { Document, Schema } from 'mongoose';
import { PlanCategory, IBaseEntity } from '../../../core/interfaces';

export interface IPlan extends IBaseEntity {
  title: string;
  description: string;
  shortDescription: string;
  category: PlanCategory;
  tags: string[];
  images: string[];
  price: {
    amount: number;
    currency: string;
    includes: string[];
    excludes: string[];
  };
  duration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks';
  };
  location: {
    city: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    meetingPoint?: string;
  };
  capacity: {
    min: number;
    max: number;
  };
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  language: string[];
  ageRestriction: {
    min?: number;
    max?: number;
  };
  requirements: string[];
  whatToBring: string[];
  cancellationPolicy: string;
  isActive: boolean;
  isVerified: boolean;
  createdBy: mongoose.Types.ObjectId; // Reference to User (business/guide)
  businessInfo?: mongoose.Types.ObjectId; // Reference to Business
  schedule: {
    availability: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
    timeSlots: {
      start: string; // Format: "09:00"
      end: string;   // Format: "17:00"
    }[];
    blackoutDates: Date[];
  };
  rating: {
    average: number;
    count: number;
  };
  stats: {
    views: number;
    bookings: number;
    favorites: number;
  };
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
  };
}

export interface IPlanDocument extends Omit<IPlan, '_id'>, Document {}

const planSchema = new Schema<IPlanDocument>(
  {
    title: {
      type: String,
      required: [true, 'Plan title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      minlength: [5, 'Title must be at least 5 characters'],
    },
    description: {
      type: String,
      required: [true, 'Plan description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      minlength: [50, 'Description must be at least 50 characters'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description cannot exceed 200 characters'],
      minlength: [20, 'Short description must be at least 20 characters'],
    },
    category: {
      type: String,
      enum: Object.values(PlanCategory),
      required: [true, 'Plan category is required'],
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
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
    price: {
      amount: {
        type: Number,
        required: [true, 'Price amount is required'],
        min: [0, 'Price cannot be negative'],
      },
      currency: {
        type: String,
        enum: ['COP', 'USD'],
        default: 'COP',
      },
      includes: [String],
      excludes: [String],
    },
    duration: {
      value: {
        type: Number,
        required: [true, 'Duration value is required'],
        min: [1, 'Duration must be at least 1'],
      },
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks'],
        required: [true, 'Duration unit is required'],
      },
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
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
      meetingPoint: String,
    },
    capacity: {
      min: {
        type: Number,
        required: [true, 'Minimum capacity is required'],
        min: [1, 'Minimum capacity must be at least 1'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum capacity is required'],
        validate: {
          validator: function(this: IPlanDocument, max: number) {
            return max >= this.capacity.min;
          },
          message: 'Maximum capacity must be greater than or equal to minimum capacity',
        },
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'expert'],
      default: 'easy',
    },
    language: [{
      type: String,
      enum: ['es', 'en', 'fr', 'pt'],
      default: ['es'],
    }],
    ageRestriction: {
      min: {
        type: Number,
        min: [0, 'Minimum age cannot be negative'],
        max: [100, 'Invalid minimum age'],
      },
      max: {
        type: Number,
        min: [0, 'Maximum age cannot be negative'],
        max: [150, 'Invalid maximum age'],
      },
    },
    requirements: [String],
    whatToBring: [String],
    cancellationPolicy: {
      type: String,
      required: [true, 'Cancellation policy is required'],
      maxlength: [1000, 'Cancellation policy cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Plan creator is required'],
    },
    businessInfo: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
    },
    schedule: {
      availability: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      }],
      timeSlots: [{
        start: {
          type: String,
          validate: {
            validator: function(time: string) {
              return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
            },
            message: 'Time must be in HH:MM format',
          },
        },
        end: {
          type: String,
          validate: {
            validator: function(time: string) {
              return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
            },
            message: 'Time must be in HH:MM format',
          },
        },
      }],
      blackoutDates: [Date],
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
      views: {
        type: Number,
        default: 0,
        min: [0, 'Views cannot be negative'],
      },
      bookings: {
        type: Number,
        default: 0,
        min: [0, 'Bookings cannot be negative'],
      },
      favorites: {
        type: Number,
        default: 0,
        min: [0, 'Favorites cannot be negative'],
      },
    },
    seoData: {
      metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
      },
      metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
      },
      slug: {
        type: String,
        required: [true, 'SEO slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
          validator: function(slug: string) {
            return /^[a-z0-9-]+$/.test(slug);
          },
          message: 'Slug can only contain lowercase letters, numbers, and hyphens',
        },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
planSchema.index({ category: 1 });
planSchema.index({ 'location.city': 1 });
planSchema.index({ 'location.coordinates': '2dsphere' }); // For geospatial queries
planSchema.index({ tags: 1 });
planSchema.index({ isActive: 1, isVerified: 1 });
planSchema.index({ 'rating.average': -1 });
planSchema.index({ createdAt: -1 });
planSchema.index({ 'seoData.slug': 1 }, { unique: true });
planSchema.index({ createdBy: 1 });
planSchema.index({ businessInfo: 1 });

// Generate slug from title before saving
planSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.seoData.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Add random suffix to ensure uniqueness
    this.seoData.slug += '-' + Math.random().toString(36).substring(2, 8);
  }
  next();
});

// Virtual for formatted price
planSchema.virtual('formattedPrice').get(function() {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: this.price.currency,
  });
  return formatter.format(this.price.amount);
});

// Virtual populate for reviews
planSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'plan',
  justOne: false,
});

export const Plan = mongoose.model<IPlanDocument>('Plan', planSchema);