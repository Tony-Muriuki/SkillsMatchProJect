import express, { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  '/upload',
  [authenticate, authorize([Role.JOBSEEKER]), uploadMiddleware.uploadCV],
  (req: Request, res: Response) => {
    res.status(201).json({
      message: 'This endpoint will upload a CV',
      info: 'Implementation pending',
      file: req.file,
    });
  }
);

router.get('/:userId', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'This endpoint would return CV details',
    info: 'Implementation pending',
  });
});

router.get('/:userId/download', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'This endpoint would return the CV file',
    info: 'Implementation pending',
  });
});

router.post(
  '/parse',
  [authenticate, authorize([Role.JOBSEEKER])],
  (req: Request, res: Response) => {
    res.status(200).json({
      message: 'This endpoint would parse skills from a CV',
      info: 'Implementation pending',
      file: req.file,
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    });
  }
);

router.delete('/:userId', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'This endpoint would delete a CV',
    info: 'Implementation pending',
  });
});

export default router;
