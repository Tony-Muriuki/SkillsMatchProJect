import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as portfoliosController from '../controllers/portfolios.controller';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /api/portfolios/me:
 *   get:
 *     summary: Get my portfolio (for logged in user)
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User portfolio
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, portfoliosController.getMyPortfolio);

/**
 * @swagger
 * /api/portfolios/{userId}:
 *   get:
 *     summary: Get portfolio for a user
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User portfolio
 *       404:
 *         description: Portfolio not found
 */
router.get('/:userId', portfoliosController.getUserPortfolio);

/**
 * @swagger
 * /api/portfolios:
 *   put:
 *     summary: Update portfolio
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               summary:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     level:
 *                       type: string
 *                       enum: [Beginner, Intermediate, Advanced, Expert]
 *                     years:
 *                       type: number
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     school:
 *                       type: string
 *                     degree:
 *                       type: string
 *                     field:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     current:
 *                       type: boolean
 *               experience:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     company:
 *                       type: string
 *                     title:
 *                       type: string
 *                     location:
 *                       type: string
 *                     description:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     current:
 *                       type: boolean
 *               projects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     url:
 *                       type: string
 *                     technologies:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/', authenticate, portfoliosController.updatePortfolio);

/**
 * @swagger
 * /api/portfolios/skills:
 *   post:
 *     summary: Add a skill to portfolio
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - level
 *               - years
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced, Expert]
 *               years:
 *                 type: number
 *     responses:
 *       201:
 *         description: Skill added to portfolio
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Skill already exists in portfolio
 */
router.post(
  '/skills',
  [
    authenticate,
    body('name').notEmpty().withMessage('Skill name is required'),
    body('level')
      .isIn(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
      .withMessage('Valid skill level is required'),
    body('years')
      .isNumeric()
      .withMessage('Years of experience must be a number'),
    validate,
  ],
  portfoliosController.addSkill
);

/**
 * @swagger
 * /api/portfolios/skills/{skillId}:
 *   delete:
 *     summary: Remove a skill from portfolio
 *     tags: [Portfolios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill removed from portfolio
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Portfolio or skill not found
 */
router.delete(
  '/skills/:skillId',
  authenticate,
  portfoliosController.removeSkill
);

export default router;
