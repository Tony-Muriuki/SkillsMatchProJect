import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  AuthRequest,
  ApplicationDTO,
  UpdateApplicationStatusDTO,
} from '../types';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

/**
 * Get all applications for a job seeker
 * @route GET /api/applications
 */
export const getMyApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    if (req.user.role !== 'JOBSEEKER') {
      throw ApiError.forbidden('Only job seekers can view their applications');
    }

    const applications = await prisma.application.findMany({
      where: {
        applicantId: req.user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            salary: true,
            postedDate: true,
            recruiter: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    company: true,
                  },
                },
              },
            },
          },
        },
        interviews: true,
      },
      orderBy: {
        appliedDate: 'desc',
      },
    });

    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all applications for a job
 * @route GET /api/applications/job/:jobId
 */
export const getApplicationsForJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { jobId } = req.params;

    // Find the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw ApiError.notFound(`Job with id ${jobId} not found`);
    }

    // Check if user is the recruiter who posted the job or an admin
    if (job.recruiterId !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden(
        'You do not have permission to view applications for this job'
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        jobId,
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
            portfolio: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
            cv: true,
          },
        },
        interviews: true,
      },
      orderBy: {
        appliedDate: 'desc',
      },
    });

    res.status(200).json({ applications });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply for a job
 * @route POST /api/applications
 */
export const applyForJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    if (req.user.role !== 'JOBSEEKER') {
      throw ApiError.forbidden('Only job seekers can apply for jobs');
    }

    const { jobId, coverLetter } = req.body as ApplicationDTO;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!job) {
      throw ApiError.notFound(`Job with id ${jobId} not found`);
    }

    // Check if user has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId: req.user.id,
        },
      },
    });

    if (existingApplication) {
      throw ApiError.conflict('You have already applied for this job');
    }

    // Calculate match percentage
    let matchPercentage = null;

    // Get user's portfolio skills
    const userSkills = await prisma.portfolioSkill.findMany({
      where: {
        portfolio: {
          userId: req.user.id,
        },
      },
      include: {
        skill: true,
      },
    });

    // Calculate match percentage
    if (job.skills.length > 0 && userSkills.length > 0) {
      const jobSkillIds = job.skills.map((js) => js.skillId);
      const userSkillIds = userSkills.map((us) => us.skillId);

      // Find matching skills
      const matchingSkills = jobSkillIds.filter((id) =>
        userSkillIds.includes(id)
      );

      // Calculate percentage
      matchPercentage =
        jobSkillIds.length > 0
          ? (matchingSkills.length / jobSkillIds.length) * 100
          : 0;
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        applicantId: req.user.id,
        status: 'applied',
        coverLetter,
        matchPercentage,
      },
    });

    // Create notification for recruiter
    await prisma.notification.create({
      data: {
        userId: job.recruiterId,
        type: 'application',
        title: 'New Job Application',
        content: `${req.user.name} has applied for the position of ${job.title}`,
        link: `/dashboard/recruiter?tab=applications&jobId=${jobId}`,
        actionText: 'View Application',
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update application status
 * @route PATCH /api/applications/:id/status
 */
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const { status } = req.body as UpdateApplicationStatusDTO;

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        applicant: true,
      },
    });

    if (!application) {
      throw ApiError.notFound(`Application with id ${id} not found`);
    }

    // Check if user is the recruiter who posted the job or an admin
    if (
      application.job.recruiterId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      throw ApiError.forbidden(
        'You do not have permission to update this application'
      );
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        lastUpdated: new Date(),
      },
    });

    // Create notification for applicant
    await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: 'application',
        title: 'Application Status Update',
        content: `Your application for ${application.job.title} has been updated to ${status}`,
        link: `/dashboard/job-seeker?tab=applications`,
        actionText: 'View Applications',
      },
    });

    res.status(200).json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule an interview
 * @route POST /api/applications/:id/interview
 */
export const scheduleInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const { scheduledDate, scheduledTime, notes } = req.body;

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        applicant: true,
      },
    });

    if (!application) {
      throw ApiError.notFound(`Application with id ${id} not found`);
    }

    // Check if user is the recruiter who posted the job or an admin
    if (
      application.job.recruiterId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      throw ApiError.forbidden(
        'You do not have permission to schedule an interview'
      );
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        applicationId: id,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        status: 'scheduled',
        notes,
      },
    });

    // Update application status to interview
    await prisma.application.update({
      where: { id },
      data: {
        status: 'interview',
        lastUpdated: new Date(),
      },
    });

    // Create notification for applicant
    await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: 'interview',
        title: 'Interview Scheduled',
        content: `An interview has been scheduled for your application to ${application.job.title}`,
        link: `/dashboard/job-seeker?tab=applications`,
        actionText: 'View Details',
      },
    });

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview,
    });
  } catch (error) {
    next(error);
  }
};
