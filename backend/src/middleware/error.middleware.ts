import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';

const errorMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 if statusCode is not set
  const statusCode = (err as ApiError).statusCode || 500;

  const errorResponse = {
    message: err.message || 'Internal Server Error',
    status: statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Log error details
  logger.error(
    `${req.method} ${req.originalUrl} - ${statusCode} - ${err.message}`,
    {
      error: err.name,
      userId: (req as AuthRequest).user?.id || 'unauthenticated',
      requestBody: req.body,
    }
  );

  res.status(statusCode).json(errorResponse);
};

export default errorMiddleware;
