import { Router } from 'express';
import { UserController } from '../controllers';
import { AuthMiddleware } from '../../auth/middleware/auth.middleware';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination and filters
 * @access  Private (Admin or same user)
 */
router.get('/', authMiddleware.authenticate, userController.getUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or same user)
 */
router.get('/:id', authMiddleware.authenticate, userController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user by ID
 * @access  Private (Admin or same user)
 */
router.put('/:id', authMiddleware.authenticate, userController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user by ID (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware.authenticate, userController.deleteUser);

// Password Management
/**
 * @route   PUT /api/v1/users/me/change-password
 * @desc    Change current user password
 * @access  Private
 */
router.put('/me/change-password', authMiddleware.authenticate, userController.changePassword);

// Preferences Management
/**
 * @route   PUT /api/v1/users/me/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/me/preferences', authMiddleware.authenticate, userController.updatePreferences);

// Avatar Management
/**
 * @route   PUT /api/v1/users/me/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.put('/me/avatar', authMiddleware.authenticate, userController.updateAvatar);

// Favorites Management
/**
 * @route   GET /api/v1/users/me/favorites
 * @desc    Get user favorite destinations
 * @access  Private
 */
router.get('/me/favorites', authMiddleware.authenticate, userController.getFavorites);

/**
 * @route   POST /api/v1/users/me/favorites
 * @desc    Add destination to favorites
 * @access  Private
 */
router.post('/me/favorites', authMiddleware.authenticate, userController.addFavorite);

/**
 * @route   DELETE /api/v1/users/me/favorites/:destinationId
 * @desc    Remove destination from favorites
 * @access  Private
 */
router.delete('/me/favorites/:destinationId', authMiddleware.authenticate, userController.removeFavorite);

// Statistics
/**
 * @route   GET /api/v1/users/me/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/me/stats', authMiddleware.authenticate, userController.getUserStats);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get user statistics by ID
 * @access  Private (Admin or same user)
 */
router.get('/:id/stats', authMiddleware.authenticate, userController.getUserStats);

export { router as userRoutes };