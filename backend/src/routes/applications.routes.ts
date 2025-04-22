import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as applicationsController from '../controllers/applications.controller';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Get all applications for current job seeker
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job seekers can view their applications
 */
router.get(
  '/',
  [authenticate, authorize([Role.JOBSEEKER])],
  applicationsController.getMyApplications
);

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Get all applications for a specific job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of applications for the job
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only the job recruiter or admin can view
 *       404:
 *         description: Job not found
 */
router.get(
  '/job/:jobId',
  [authenticate, authorize([Role.RECRUITER, Role.ADMIN])],
  applicationsController.getApplicationsForJob
);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job seekers can apply
 *       404:
 *         description: Job not found
 *       409:
 *         description: You have already applied for this job
 */
router.post(
  '/',
  [
    authenticate,
    authorize([Role.JOBSEEKER]),
    body('jobId').notEmpty().withMessage('Job ID is required'),
    validate,
  ],
  applicationsController.applyForJob
);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [applied, screening, interview, offer, rejected]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only the job recruiter or admin can update
 *       404:
 *         description: Application not found
 */
router.patch(
  '/:id/status',
  [
    authenticate,
    authorize([Role.RECRUITER, Role.ADMIN]),
    body('status')
      .isIn(['applied', 'screening', 'interview', 'offer', 'rejected'])
      .withMessage(
        'Status must be one of: applied, screening, interview, offer, rejected'
      ),
    validate,
  ],
  applicationsController.updateApplicationStatus
);

/**
 * @swagger
 * /api/applications/{id}/interview:
 *   post:
 *     summary: Schedule an interview for an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduledDate
 *               - scheduledTime
 *             properties:
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 */
export default router;
