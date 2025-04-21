import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadCV } from '../middleware/upload.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /api/cvs/upload:
 *   post:
 *     summary: Upload a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or Word document)
 *     responses:
 *       201:
 *         description: CV uploaded successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job seekers can upload CVs
 */
router.post(
  '/upload',
  [authenticate, authorize([Role.JOBSEEKER]), uploadCV],
  (req, res) => {
    // This would be implemented in the controller
    res.status(201).json({
      message: 'This endpoint would upload a CV',
      info: 'Implementation pending',
      file: req.file,
    });
  }
);

/**
 * @swagger
 * /api/cvs/{userId}:
 *   get:
 *     summary: Get CV for a user
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: CV details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only recruiters or the owner can view
 *       404:
 *         description: CV not found
 */
router.get('/:userId', authenticate, (req, res) => {
  // This would be implemented in the controller
  res.status(200).json({
    message: 'This endpoint would return CV details',
    info: 'Implementation pending',
  });
});

/**
 * @swagger
 * /api/cvs/{userId}/download:
 *   get:
 *     summary: Download a CV file
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: CV file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only recruiters or the owner can download
 *       404:
 *         description: CV not found
 */
router.get('/:userId/download', authenticate, (req, res) => {
  // This would be implemented in the controller
  res.status(200).json({
    message: 'This endpoint would return the CV file',
    info: 'Implementation pending',
  });
});

/**
 * @swagger
 * /api/cvs/parse:
 *   post:
 *     summary: Parse skills from a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or Word document)
 *     responses:
 *       200:
 *         description: Parsed skills from CV
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only job seekers can use this
 */
router.post(
  '/parse',
  [authenticate, authorize([Role.JOBSEEKER]), uploadCV],
  (req, res) => {
    // This would be implemented in the controller
    // In a real app, this would integrate with an AI service or library to extract skills
    res.status(200).json({
      message: 'This endpoint would parse skills from a CV',
      info: 'Implementation pending',
      file: req.file,
      // Mock extracted skills
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    });
  }
);

/**
 * @swagger
 * /api/cvs/{userId}:
 *   delete:
 *     summary: Delete a CV
 *     tags: [CVs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: CV deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - only the owner or admin can delete
 *       404:
 *         description: CV not found
 */
router.delete('/:userId', authenticate, (req, res) => {
  // This would be implemented in the controller
  res.status(200).json({
    message: 'This endpoint would delete a CV',
    info: 'Implementation pending',
  });
});

export default router;
