import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  AuthRequest,
  PortfolioDTO,
  SkillDTO,
  EducationDTO,
  ExperienceDTO,
  ProjectDTO,
} from '../types';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

/**
 * Get portfolio for a user
 * @route GET /api/portfolios/:userId
 */
export const getUserPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        projects: true,
        experiences: true,
        education: true,
      },
    });

    if (!portfolio) {
      throw ApiError.notFound(`Portfolio for user ${userId} not found`);
    }

    res.status(200).json({ portfolio });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my portfolio (for logged in user)
 * @route GET /api/portfolios/me
 */
export const getMyPortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        projects: true,
        experiences: true,
        education: true,
      },
    });

    if (!portfolio) {
      // Create a new portfolio if one doesn't exist
      const newPortfolio = await prisma.portfolio.create({
        data: {
          userId: req.user.id,
          summary: '',
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          projects: true,
          experiences: true,
          education: true,
        },
      });

      return res.status(200).json({ portfolio: newPortfolio });
    }

    res.status(200).json({ portfolio });
  } catch (error) {
    next(error);
  }
};

/**
 * Update portfolio
 * @route PUT /api/portfolios
 */
export const updatePortfolio = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const portfolioData = req.body as PortfolioDTO;

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: req.user.id,
          summary: portfolioData.summary || '',
        },
      });
    } else {
      // Update summary if provided
      if (portfolioData.summary !== undefined) {
        portfolio = await prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            summary: portfolioData.summary,
            updatedAt: new Date(),
          },
        });
      }
    }

    // Update portfolio with full data
    const updatedPortfolio = await updatePortfolioData(
      portfolio.id,
      portfolioData
    );

    res.status(200).json({
      message: 'Portfolio updated successfully',
      portfolio: updatedPortfolio,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a skill to portfolio
 * @route POST /api/portfolios/skills
 */
export const addSkill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const skillData = req.body as SkillDTO;

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: req.user.id,
          summary: '',
        },
      });
    }

    // Find or create skill
    let skill = await prisma.skill.findFirst({
      where: {
        name: { equals: skillData.name, mode: 'insensitive' },
      },
    });

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          name: skillData.name,
          category: 'General', // Default category
        },
      });
    }

    // Check if skill is already in portfolio
    const existingPortfolioSkill = await prisma.portfolioSkill.findUnique({
      where: {
        portfolioId_skillId: {
          portfolioId: portfolio.id,
          skillId: skill.id,
        },
      },
    });

    if (existingPortfolioSkill) {
      throw ApiError.conflict(
        `Skill ${skillData.name} is already in portfolio`
      );
    }

    // Convert skill level to numeric proficiency (1-5)
    let proficiency = 1;
    switch (skillData.level) {
      case 'Beginner':
        proficiency = 1;
        break;
      case 'Intermediate':
        proficiency = 2;
        break;
      case 'Advanced':
        proficiency = 4;
        break;
      case 'Expert':
        proficiency = 5;
        break;
      default:
        proficiency = 1;
    }

    // Add skill to portfolio
    const portfolioSkill = await prisma.portfolioSkill.create({
      data: {
        portfolioId: portfolio.id,
        skillId: skill.id,
        proficiency,
        yearsOfExperience: skillData.years,
      },
      include: {
        skill: true,
      },
    });

    res.status(201).json({
      message: 'Skill added to portfolio',
      skill: portfolioSkill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a skill from portfolio
 * @route DELETE /api/portfolios/skills/:skillId
 */
export const removeSkill = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { skillId } = req.params;

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
    });

    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found');
    }

    // Delete the portfolio skill
    await prisma.portfolioSkill.deleteMany({
      where: {
        portfolioId: portfolio.id,
        skillId,
      },
    });

    res.status(200).json({
      message: 'Skill removed from portfolio',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add education to portfolio
 * @route POST /api/portfolios/education
 */
export const addEducation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const educationData = req.body as EducationDTO;

    // Get or create portfolio
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: req.user.id,
          summary: '',
        },
      });
    }

    // Add education to portfolio
    const education = await prisma.education.create({
      data: {
        portfolioId: portfolio.id,
        school: educationData.school,
        degree: educationData.degree,
        field: educationData.field,
        startDate: new Date(educationData.startDate),
        endDate: educationData.endDate ? new Date(educationData.endDate) : null,
        current: educationData.current,
      },
    });

    res.status(201).json({
      message: 'Education added to portfolio',
      education,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update education in portfolio
 * @route PUT /api/portfolios/education/:educationId
 */
export const updateEducation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { educationId } = req.params;
    const educationData = req.body as EducationDTO;

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
    });

    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found');
    }

    // Check if education exists and belongs to this portfolio
    const education = await prisma.education.findFirst({
      where: {
        id: educationId,
        portfolioId: portfolio.id,
      },
    });

    if (!education) {
      throw ApiError.notFound('Education not found in portfolio');
    }

    // Update education
    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: {
        school: educationData.school,
        degree: educationData.degree,
        field: educationData.field,
        startDate: new Date(educationData.startDate),
        endDate: educationData.endDate ? new Date(educationData.endDate) : null,
        current: educationData.current,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      message: 'Education updated successfully',
      education: updatedEducation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete education from portfolio
 * @route DELETE /api/portfolios/education/:educationId
 */
export const deleteEducation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    const { educationId } = req.params;

    // Get portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
    });

    if (!portfolio) {
      throw ApiError.notFound('Portfolio not found');
    }

    // Check if education exists and belongs to this portfolio
    const education = await prisma.education.findFirst({
      where: {
        id: educationId,
        portfolioId: portfolio.id,
      },
    });

    if (!education) {
      throw ApiError.notFound('Education not found in portfolio');
    }

    // Delete education
    await prisma.education.delete({
      where: { id: educationId },
    });

    res.status(200).json({
      message: 'Education deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update portfolio data
 */
const updatePortfolioData = async (portfolioId: string, data: PortfolioDTO) => {
  // Get the current portfolio
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      skills: true,
      education: true,
      experiences: true,
      projects: true,
    },
  });

  if (!portfolio) {
    throw ApiError.notFound('Portfolio not found');
  }

  // Update or create skills
  if (data.skills && data.skills.length > 0) {
    // Clear existing skills
    await prisma.portfolioSkill.deleteMany({
      where: { portfolioId },
    });

    // Add new skills
    for (const skillData of data.skills) {
      // Find or create skill
      let skill = await prisma.skill.findFirst({
        where: {
          name: { equals: skillData.name, mode: 'insensitive' },
        },
      });

      if (!skill) {
        skill = await prisma.skill.create({
          data: {
            name: skillData.name,
            category: 'General', // Default category
          },
        });
      }

      // Convert skill level to numeric proficiency (1-5)
      let proficiency = 1;
      switch (skillData.level) {
        case 'Beginner':
          proficiency = 1;
          break;
        case 'Intermediate':
          proficiency = 2;
          break;
        case 'Advanced':
          proficiency = 4;
          break;
        case 'Expert':
          proficiency = 5;
          break;
        default:
          proficiency = 1;
      }

      // Add skill to portfolio
      await prisma.portfolioSkill.create({
        data: {
          portfolioId,
          skillId: skill.id,
          proficiency,
          yearsOfExperience: skillData.years,
        },
      });
    }
  }

  // Update or create education entries
  if (data.education && data.education.length > 0) {
    // Clear existing education entries
    await prisma.education.deleteMany({
      where: { portfolioId },
    });

    // Add new education entries
    for (const educationData of data.education) {
      await prisma.education.create({
        data: {
          portfolioId,
          school: educationData.school,
          degree: educationData.degree,
          field: educationData.field,
          startDate: new Date(educationData.startDate),
          endDate: educationData.endDate
            ? new Date(educationData.endDate)
            : null,
          current: educationData.current,
        },
      });
    }
  }

  // Update or create experience entries
  if (data.experience && data.experience.length > 0) {
    // Clear existing experience entries
    await prisma.experience.deleteMany({
      where: { portfolioId },
    });

    // Add new experience entries
    for (const experienceData of data.experience) {
      await prisma.experience.create({
        data: {
          portfolioId,
          title: experienceData.title,
          company: experienceData.company,
          location: experienceData.location || '',
          description: experienceData.description || '',
          startDate: new Date(experienceData.startDate),
          endDate: experienceData.endDate
            ? new Date(experienceData.endDate)
            : null,
          current: experienceData.current,
        },
      });
    }
  }

  // Update or create project entries
  if (data.projects && data.projects.length > 0) {
    // Clear existing project entries
    await prisma.project.deleteMany({
      where: { portfolioId },
    });

    // Add new project entries
    for (const projectData of data.projects) {
      await prisma.project.create({
        data: {
          portfolioId,
          title: projectData.name,
          description: projectData.description || '',
          projectUrl: projectData.url || '',
          technologies: projectData.technologies?.join(', ') || '',
        },
      });
    }
  }

  // Return updated portfolio
  return await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      education: true,
      experiences: true,
      projects: true,
    },
  });
};
