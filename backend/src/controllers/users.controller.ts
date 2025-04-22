import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import { hashPassword } from '../utils/password.utils';

const prisma = new PrismaClient();

/**
 * Get all users (admin only)
 * @route GET /api/users
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    // Only admin can access all users
    if (req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only admins can access all users');
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Users can access their own data or admin can access any user's data
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'You do not have permission to access this user'
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user) {
      throw ApiError.notFound(`User with id ${id} not found`);
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PUT /api/users/:id/profile
 */
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Users can update their own profile or admin can update any profile
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'You do not have permission to update this profile'
      );
    }

    const {
      title,
      company,
      bio,
      location,
      contactEmail,
      phone,
      linkedinUrl,
      githubUrl,
      websiteUrl,
    } = req.body;

    // First check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: id },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId: id },
        data: {
          title,
          company,
          bio,
          location,
          contactEmail,
          phone,
          linkedinUrl,
          githubUrl,
          websiteUrl,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: id,
          title,
          company,
          bio,
          location,
          contactEmail,
          phone,
          linkedinUrl,
          githubUrl,
          websiteUrl,
        },
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password
 * @route PUT /api/users/:id/password
 */
export const updatePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Users can update their own password or admin can update any password
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'You do not have permission to update this password'
      );
    }

    const { currentPassword, newPassword } = req.body;

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw ApiError.notFound(`User with id ${id} not found`);
    }

    // Verify current password (skip for admin)
    if (req.user.role !== 'ADMIN') {
      const isPasswordValid = await prisma.user.findFirst({
        where: {
          id,
          password: currentPassword,
        },
      });

      if (!isPasswordValid) {
        throw ApiError.badRequest('Current password is incorrect');
      }
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Users can delete their own account or admin can delete any account
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'You do not have permission to delete this user'
      );
    }

    // Delete the user (this will cascade delete related data)
    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user stats (admin only)
 * @route GET /api/users/stats
 */
export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    // Only admin can access stats
    if (req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only admins can access user stats');
    }

    // Get user counts by role
    const totalUsers = await prisma.user.count();
    const jobSeekerCount = await prisma.user.count({
      where: { role: 'JOBSEEKER' },
    });
    const recruiterCount = await prisma.user.count({
      where: { role: 'RECRUITER' },
    });
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    // Get monthly registrations
    const currentYear = new Date().getFullYear();
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);

      const monthlyJobSeekers = await prisma.user.count({
        where: {
          role: 'JOBSEEKER',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const monthlyRecruiters = await prisma.user.count({
        where: {
          role: 'RECRUITER',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      monthlyData.push({
        month: startDate.toLocaleString('default', { month: 'short' }),
        jobSeekers: monthlyJobSeekers,
        recruiters: monthlyRecruiters,
      });
    }

    res.status(200).json({
      totalUsers,
      byRole: {
        jobSeekers: jobSeekerCount,
        recruiters: recruiterCount,
        admins: adminCount,
      },
      monthlyData,
    });
  } catch (error) {
    next(error);
  }
};
