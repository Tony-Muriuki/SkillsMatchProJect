import { Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid token. User not found.');
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(ApiError.unauthorized('Token expired.'));
    } else if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid token.'));
    }
  }
};

/**
 * Role-based access control middleware
 * @param roles - Array of allowed roles
 */
export const authorize = (roles: Role[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('User not authenticated.'));
      return;
    }

    // Check if user's role is in the authorized roles
    if (roles.length && !roles.includes(req.user.role)) {
      next(ApiError.forbidden('Access denied. Insufficient permissions.'));
      return;
    }

    next();
  };
};
