import mongoose, { Document, Schema } from 'mongoose';
import { IBaseEntity } from '../../../core/interfaces';

export interface IReview extends IBaseEntity {
  plan: mongoose.Types.ObjectId; // Reference to Plan
  user: mongoose.Types.ObjectId; // Reference to User (reviewer)
  booking: mongoose.Types.ObjectId; // Reference to Booking
  business?: mongoose.Types.ObjectId; // Reference to Business
  rating: {
    overall: number;
    value: number;
    service: number;
    cleanliness: number;
    location: number;
    communication: number;
  };
  comment: string;
  photos?: string[];
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  isVerified: boolean; // Verified purchase/booking
  isAnonymous: boolean;
  helpfulVotes: {
    user: mongoose.Types.ObjectId;
    votedAt: Date;
  }[];
  reportedBy?: {
    user: mongoose.Types.ObjectId;
    reason: string;
    reportedAt: Date;
  }[];
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatedBy?: mongoose.Types.ObjectId; // Reference to Admin User
  moderatedAt?: Date;
  moderationNotes?: string;
  businessResponse?: {
    message: string;
    respondedAt: Date;
    respondedBy: mongoose.Types.ObjectId; // Reference to Business User
  };
  metadata: {
    source: 'web' | 'mobile' | 'admin';
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface IReviewDocument extends Omit<IReview, '_id'>, Document {
  calculateAverageRating(): number;
  isHelpful(userId: string): boolean;
  addHelpfulVote(userId: string): void;
  removeHelpfulVote(userId: string): void;
  canBeEdited(userId: string): boolean;
  canBeDeleted(userId: string): boolean;
}

const reviewSchema = new Schema<IReviewDocument>(
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
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking is required'],
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
    },
    rating: {
      overall: {
        type: Number,
        required: [true, 'Overall rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      value: {
        type: Number,
        required: [true, 'Value rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      service: {
        type: Number,
        required: [true, 'Service rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      cleanliness: {
        type: Number,
        required: [true, 'Cleanliness rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      location: {
        type: Number,
        required: [true, 'Location rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
      communication: {
        type: Number,
        required: [true, 'Communication rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
      },
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    photos: [{
      type: String,
      validate: {
        validator: function(url: string) {
          const urlRegex = /^https?:\/\/.+/;
          return urlRegex.test(url);
        },
        message: 'Please provide valid photo URLs',
      },
    }],
    pros: [{
      type: String,
      trim: true,
      maxlength: [100, 'Pro cannot exceed 100 characters'],
    }],
    cons: [{
      type: String,
      trim: true,
      maxlength: [100, 'Con cannot exceed 100 characters'],
    }],
    wouldRecommend: {
      type: Boolean,
      required: [true, 'Recommendation status is required'],
    },
    isVerified: {
      type: Boolean,
      default: true, // True if created from a completed booking
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    reportedBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      reason: {
        type: String,
        required: true,
        enum: [
          'inappropriate_content',
          'spam',
          'fake_review',
          'offensive_language',
          'irrelevant',
          'other'
        ],
      },
      reportedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved', // Auto-approve for verified bookings
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: Date,
    moderationNotes: String,
    businessResponse: {
      message: {
        type: String,
        maxlength: [500, 'Business response cannot exceed 500 characters'],
        trim: true,
      },
      respondedAt: {
        type: Date,
        default: Date.now,
      },
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    metadata: {
      source: {
        type: String,
        enum: ['web', 'mobile', 'admin'],
        default: 'web',
      },
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for better performance
reviewSchema.index({ plan: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking
reviewSchema.index({ business: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ moderationStatus: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerified: 1 });

// Calculate average rating before saving
reviewSchema.pre('save', function(next) {
  if (this.isModified('rating')) {
    this.rating.overall = this.calculateAverageRating();
  }
  next();
});

// Calculate average rating
reviewSchema.methods.calculateAverageRating = function(): number {
  const ratings = [
    this.rating.value,
    this.rating.service,
    this.rating.cleanliness,
    this.rating.location,
    this.rating.communication,
  ];
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
};

// Check if review is marked as helpful by user
reviewSchema.methods.isHelpful = function(userId: string): boolean {
  return this.helpfulVotes.some((vote: any) => vote.user.toString() === userId);
};

// Add helpful vote
reviewSchema.methods.addHelpfulVote = function(userId: string): void {
  if (!this.isHelpful(userId)) {
    this.helpfulVotes.push({
      user: new mongoose.Types.ObjectId(userId),
      votedAt: new Date(),
    });
  }
};

// Remove helpful vote
reviewSchema.methods.removeHelpfulVote = function(userId: string): void {
  this.helpfulVotes = this.helpfulVotes.filter(
    (vote: any) => vote.user.toString() !== userId
  );
};

// Check if review can be edited by user
reviewSchema.methods.canBeEdited = function(userId: string): boolean {
  const now = new Date();
  const reviewAge = (now.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60); // Hours
  
  return (
    this.user.toString() === userId &&
    reviewAge <= 24 && // Can edit within 24 hours
    this.moderationStatus === 'approved'
  );
};

// Check if review can be deleted by user
reviewSchema.methods.canBeDeleted = function(userId: string): boolean {
  return this.user.toString() === userId;
};

// Virtual for helpful votes count
reviewSchema.virtual('helpfulVotesCount').get(function() {
  return this.helpfulVotes.length;
});

// Transform toJSON to hide sensitive data
reviewSchema.methods.toJSON = function() {
  const review = this.toObject({ virtuals: true });
  
  if (this.isAnonymous) {
    delete review.user;
  }
  
  delete review.reportedBy;
  delete review.metadata;
  
  return review;
};

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);