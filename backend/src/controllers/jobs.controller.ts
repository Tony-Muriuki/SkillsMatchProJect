import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, CreateJobDTO, JobFilter } from '../types';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

/**
 * Get all jobs with filtering and pagination
 * @route GET /api/jobs
 */
export const getAllJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      location,
      type,
      category,
      experience,
      salary,
      page = 1,
      limit = 10,
    } = req.query as unknown as JobFilter;

    // Build filter conditions
    let whereClause: any = {
      active: true,
    };

    // Search filter (title, company, description)
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Location filter
    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    // Job type filter
    if (type) {
      if (Array.isArray(type)) {
        whereClause.type = { in: type };
      } else {
        whereClause.type = type;
      }
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        whereClause.category = { in: category };
      } else {
        whereClause.category = category;
      }
    }

    // Experience level filter
    if (experience) {
      if (Array.isArray(experience)) {
        whereClause.experience = { in: experience };
      } else {
        whereClause.experience = experience;
      }
    }

    // Salary filter is more complex - would need more sophisticated handling
    // This is a simplified approach
    if (salary) {
      whereClause.salary = { not: null };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Get jobs with pagination
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          postedDate: 'desc',
        },
        skip,
        take,
      }),
      prisma.job.count({
        where: whereClause,
      }),
    ]);

    // Check if match percentages should be calculated for a job seeker
    let jobsWithMatchPercentage = jobs;
    if (req.user && req.user.role === 'JOBSEEKER') {
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

      // Calculate match percentage for each job
      jobsWithMatchPercentage = jobs.map((job) => {
        // Simple matching algorithm
        const jobSkillIds = job.skills.map((js) => js.skillId);
        const userSkillIds = userSkills.map((us) => us.skillId);

        // Find matching skills
        const matchingSkills = jobSkillIds.filter((id) =>
          userSkillIds.includes(id)
        );

        // Calculate percentage
        const matchPercentage =
          jobSkillIds.length > 0
            ? Math.round((matchingSkills.length / jobSkillIds.length) * 100)
            : 0;

        return {
          ...job,
          matchPercentage,
        };
      });

      // Sort by match percentage if user is authenticated
      jobsWithMatchPercentage.sort(
        (a: any, b: any) => b.matchPercentage - a.matchPercentage
      );
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / Number(limit));

    res.status(200).json({
      jobs: jobsWithMatchPercentage,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single job by ID
 * @route GET /api/jobs/:id
 */
export const getJobById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                company: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw ApiError.notFound(`Job with id ${id} not found`);
    }

    // Calculate match percentage for job seeker
    let matchPercentage = null;
    let skillMatch = null;

    if (req.user && req.user.role === 'JOBSEEKER') {
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

      // Calculate matches for each skill
      const jobSkills = job.skills.map((js) => ({
        id: js.skillId,
        name: js.skill.name,
        importance: js.importance,
      }));

      skillMatch = jobSkills.map((jobSkill) => {
        const userSkill = userSkills.find((us) => us.skillId === jobSkill.id);
        return {
          skill: jobSkill.name,
          level: userSkill ? Math.min(userSkill.proficiency * 20, 100) : 0, // Convert to 0-100 scale
          required: jobSkill.importance * 20, // Convert to 0-100 scale
        };
      });

      // Calculate overall match percentage
      if (jobSkills.length > 0) {
        const totalMatchPoints = skillMatch.reduce(
          (sum, skill) => sum + skill.level,
          0
        );
        const totalPossiblePoints = jobSkills.length * 100;
        matchPercentage = Math.round(
          (totalMatchPoints / totalPossiblePoints) * 100
        );
      }
    }

    // Check if job is saved by user
    let isSaved = false;
    if (req.user) {
      // For simplicity, we're just returning false for now
      isSaved = false;
    }

    // Get similar jobs
    const similarJobs = await prisma.job.findMany({
      where: {
        id: { not: id },
        active: true,
        OR: [
          { title: { contains: job.title.split(' ')[0], mode: 'insensitive' } },
          { category: job.category },
          {
            skills: {
              some: {
                skillId: {
                  in: job.skills.map((s) => s.skillId),
                },
              },
            },
          },
        ],
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
      take: 3,
    });

    res.status(200).json({
      job: {
        ...job,
        matchPercentage,
        skillMatch,
        isSaved,
      },
      similarJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new job
 * @route POST /api/jobs
 */
export const createJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    // Only recruiters can create jobs
    if (req.user.role !== 'RECRUITER') {
      throw ApiError.forbidden('Only recruiters can create job listings');
    }

    const jobData = req.body as CreateJobDTO;

    // Create the job
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        category: jobData.category,
        experience: jobData.experience,
        salary: jobData.salary,
        deadline: jobData.deadline,
        recruiterId: req.user.id,
      },
    });

    // Add skills to the job
    if (jobData.skills && jobData.skills.length > 0) {
      for (const skillData of jobData.skills) {
        // Find or create the skill
        let skill = await prisma.skill.findUnique({
          where: { name: skillData.name },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              name: skillData.name,
              category: 'General', // Default category
            },
          });
        }

        // Create job skill relationship
        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            importance: skillData.importance || 3, // Default importance
          },
        });
      }
    }

    // Return the created job with skills
    const jobWithSkills = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Job created successfully',
      job: jobWithSkills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a job
 * @route PUT /api/jobs/:id
 */
export const updateJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;
    const jobData = req.body as Partial<CreateJobDTO>;

    // Find the job
    const job = await prisma.job.findUnique({
      where: { id },
      include: { skills: true },
    });

    if (!job) {
      throw ApiError.notFound(`Job with id ${id} not found`);
    }

    // Check if user is the job creator or an admin
    if (job.recruiterId !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to update this job');
    }

    // Update the job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: jobData.title,
        description: jobData.description,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        category: jobData.category,
        experience: jobData.experience,
        salary: jobData.salary,
        deadline: jobData.deadline,
        updatedAt: new Date(),
      },
    });

    // Update skills if provided
    if (jobData.skills && jobData.skills.length > 0) {
      // Delete existing skills
      await prisma.jobSkill.deleteMany({
        where: { jobId: id },
      });

      // Add new skills
      for (const skillData of jobData.skills) {
        // Find or create the skill
        let skill = await prisma.skill.findUnique({
          where: { name: skillData.name },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: {
              name: skillData.name,
              category: 'General', // Default category
            },
          });
        }

        // Create job skill relationship
        await prisma.jobSkill.create({
          data: {
            jobId: id,
            skillId: skill.id,
            importance: skillData.importance || 3, // Default importance
          },
        });
      }
    }

    // Return the updated job with skills
    const jobWithSkills = await prisma.job.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Job updated successfully',
      job: jobWithSkills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a job
 * @route DELETE /api/jobs/:id
 */
export const deleteJob = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Find the job
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw ApiError.notFound(`Job with id ${id} not found`);
    }

    // Check if user is the job creator or an admin
    if (job.recruiterId !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to delete this job');
    }

    // Delete the job (this will cascade to delete related job skills)
    await prisma.job.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle job active status
 * @route PATCH /api/jobs/:id/toggle-status
 */
export const toggleJobStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Find the job
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw ApiError.notFound(`Job with id ${id} not found`);
    }

    // Check if user is the job creator or an admin
    if (job.recruiterId !== req.user.id && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to update this job');
    }

    // Toggle the active status
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        active: !job.active,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      message: `Job ${
        updatedJob.active ? 'activated' : 'deactivated'
      } successfully`,
      job: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};
