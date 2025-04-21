import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/password.utils';
import { generateToken } from '../utils/jwt.utils';
import { ApiError } from '../utils/ApiError';
import { AuthRequest, LoginPayload, RegisterPayload } from '../types';

const prisma = new PrismaClient();

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      companyName,
      jobTitle,
    } = req.body as RegisterPayload;

    // Normalize role
    const userRole =
      role.toUpperCase() === 'JOB-SEEKER' ? 'JOBSEEKER' : role.toUpperCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict(`User with email ${email} already exists`);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: userRole as any, // Cast to Role enum
        profile: {
          create: {
            title: jobTitle || null,
            company: companyName || null,
          },
        },
        ...(userRole === 'JOBSEEKER'
          ? {
              portfolio: {
                create: {
                  summary: '',
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, adminCode } = req.body as LoginPayload;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if admin trying to login and verify admin code
    if (user.role === 'ADMIN' && adminCode !== process.env.ADMIN_SECRET_CODE) {
      throw ApiError.unauthorized('Invalid admin code');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user information
 * @route GET /api/auth/me
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    // User is already attached to request from auth middleware
    const { id } = req.user;

    // Fetch full user profile
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};
