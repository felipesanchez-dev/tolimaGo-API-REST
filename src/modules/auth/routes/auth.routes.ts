import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout current user
 * @access  Private
 */
router.post('/logout', authMiddleware.authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware.authenticate, authController.me);

/**
 * @route   POST /api/v1/auth/verify-token
 * @desc    Verify if token is valid (for internal use)
 * @access  Public
 */
router.post('/verify-token', authController.verifyToken);

export { router as authRoutes };
