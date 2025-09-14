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

export { router as userRoutes };