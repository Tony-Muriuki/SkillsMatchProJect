import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as jobsController from '../controllers/jobs.controller';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with filtering and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for job title, company, or description
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by job type (Full-time, Part-time, Contract, Remote)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by job category
 *       - in: query
 *         name: experience
 *         schema:
 *           type: string
 *         description: Filter by experience level
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of jobs with pagination
 */
router.get('/', jobsController.getAllJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:id', jobsController.getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - company
 *               - location
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               experience:
 *                 type: string
 *               salary:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     importance:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only recruiters can create jobs
 */
router.post(
  '/',
  [
    authenticate,
    authorize([Role.RECRUITER]),
    body('title').notEmpty().withMessage('Job title is required'),
    body('description').notEmpty().withMessage('Job description is required'),
    body('company').notEmpty().withMessage('Company is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('type').notEmpty().withMessage('Job type is required'),
    body('skills').isArray().withMessage('Skills must be an array'),
    validate,
  ],
  jobsController.createJob
);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               company:
 *                 type: string
 *               location:
 *                 type: string
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               experience:
 *                 type: string
 *               salary:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     importance:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job creator or admin can update
 *       404:
 *         description: Job not found
 */
router.put('/:id', [authenticate, validate], jobsController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job creator or admin can delete
 *       404:
 *         description: Job not found
 */
router.delete('/:id', authenticate, jobsController.deleteJob);

router.patch(
  '/:id/toggle-status',
  authenticate,
  jobsController.toggleJobStatus
);

export default router;
