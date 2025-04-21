import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as usersController from '../controllers/users.controller';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only admins can access
 */
router.get(
  '/',
  authenticate,
  authorize([Role.ADMIN]),
  usersController.getAllUsers
);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only admins can access
 */
router.get(
  '/stats',
  authenticate,
  authorize([Role.ADMIN]),
  usersController.getUserStats
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only own user or admin can access
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, usersController.getUserById);

/**
 * @swagger
 * /api/users/{id}/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               linkedinUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               websiteUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only own user or admin can update
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/profile',
  [
    authenticate,
    body('contactEmail')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('phone')
      .optional()
      .matches(/^\+?[0-9]{10,15}$/)
      .withMessage('Invalid phone number format'),
    body('linkedinUrl').optional().isURL().withMessage('Invalid LinkedIn URL'),
    body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
    body('websiteUrl').optional().isURL().withMessage('Invalid website URL'),
    validate,
  ],
  usersController.updateUserProfile
);

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only own user or admin can update
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/password',
  [
    authenticate,
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
    validate,
  ],
  usersController.updatePassword
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only own user or admin can delete
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, usersController.deleteUser);

export default router;
