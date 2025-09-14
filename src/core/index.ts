// Export all models from their respective modules
export { User, IUser, IUserDocument } from '../modules/users/models/User';
export { Plan, IPlan, IPlanDocument } from '../modules/plans/models/Plan';
export {
  Business,
  IBusiness,
  IBusinessDocument,
} from '../modules/business/models/Business';
export {
  Booking,
  IBooking,
  IBookingDocument,
} from '../modules/bookings/models/Booking';
export {
  Review,
  IReview,
  IReviewDocument,
} from '../modules/reviews/models/Review';
export {
  Notification,
  INotification,
  INotificationDocument,
} from '../modules/notifications/models/Notification';
export {
  AuditLog,
  IAuditLog,
  IAuditLogDocument,
} from '../modules/admin/models/AuditLog';
export {
  Session,
  ISession,
  ISessionDocument,
} from '../modules/auth/models/Session';

// Re-export core interfaces
export * from './interfaces';

// Model initialization function
import { User } from '../modules/users/models/User';
import { Plan } from '../modules/plans/models/Plan';
import { Business } from '../modules/business/models/Business';
import { Booking } from '../modules/bookings/models/Booking';
import { Review } from '../modules/reviews/models/Review';
import { Notification } from '../modules/notifications/models/Notification';
import { AuditLog } from '../modules/admin/models/AuditLog';
import { Session } from '../modules/auth/models/Session';
import { logger } from './config/logger';

/**
 * Initialize all models and their relationships
 */
export const initializeModels = (): void => {
  try {
    // Models are automatically initialized when imported
    // This function can be used to set up any additional model relationships or validations

    logger.info('✅ All database models initialized successfully');
    logger.info(
      `📋 Available models: ${[
        'User',
        'Plan',
        'Business',
        'Booking',
        'Review',
        'Notification',
        'AuditLog',
        'Session',
      ].join(', ')}`
    );
  } catch (error) {
    logger.error('❌ Error initializing models:', error);
    throw error;
  }
};

/**
 * Get model statistics
 */
export const getModelStats = async (): Promise<Record<string, number>> => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      Plan.countDocuments(),
      Business.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
      Notification.countDocuments(),
      AuditLog.countDocuments(),
      Session.countDocuments(),
    ]);

    return {
      users: stats[0],
      plans: stats[1],
      businesses: stats[2],
      bookings: stats[3],
      reviews: stats[4],
      notifications: stats[5],
      auditLogs: stats[6],
      sessions: stats[7],
    };
  } catch (error) {
    logger.error('Error getting model statistics:', error);
    throw error;
  }
};
