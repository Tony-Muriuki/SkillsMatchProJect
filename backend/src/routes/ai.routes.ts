import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as aiController from '../controllers/ai.controller';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * /api/ai/match-jobs:
 *   post:
 *     summary: Match job seeker with jobs based on skills
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of job matches with match percentages
 *       400:
 *         description: No skills found in profile
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job seekers can use this endpoint
 */
router.post(
  '/match-jobs',
  [authenticate, authorize([Role.JOBSEEKER])],
  aiController.matchJobs
);

/**
 * /api/ai/search-candidates:
 *   post:
 *     summary: Search candidates based on natural language query
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "React developers with 3+ years experience"
 *               filters:
 *                 type: object
 *                 properties:
 *                   experience:
 *                     type: number
 *                     example: 3
 *                   location:
 *                     type: string
 *                     example: "San Francisco"
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["React", "TypeScript"]
 *     responses:
 *       200:
 *         description: List of candidates matching the query
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only recruiters can use this endpoint
 */
router.post(
  '/search-candidates',
  [
    authenticate,
    authorize([Role.RECRUITER, Role.ADMIN]),
    body('query').notEmpty().withMessage('Search query is required'),
    validate,
  ],
  aiController.searchCandidates
);

/**
 * /api/ai/career-paths:
 *   post:
 *     summary: Get career path recommendations based on skills
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               currentRole:
 *                 type: string
 *               yearsOfExperience:
 *                 type: number
 *     responses:
 *       200:
 *         description: Career path recommendations
 *       400:
 *         description: No skills found in profile
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job seekers can use this endpoint
 */
router.post(
  '/career-paths',
  [authenticate, authorize([Role.JOBSEEKER])],
  aiController.getCareerPaths
);

export default router;
