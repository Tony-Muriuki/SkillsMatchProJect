import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: (error as any).path || (error as any).param || 'unknown',
      message: error.msg,
    }));

    next(new ApiError(`Validation error: ${errorMessages[0].message}`, 400));
    return;
  }

  next();
};
