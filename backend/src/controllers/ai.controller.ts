import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, MatchQueryDTO, CareerPathDTO } from '../types';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

/**
 * Match job seekers with jobs based on skills
 * @route POST /api/ai/match-jobs
 */
export const matchJobs = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    if (req.user.role !== 'JOBSEEKER') {
      throw ApiError.forbidden('Only job seekers can use job matching');
    }

    // Get user's skills from portfolio
    const userPortfolio = await prisma.portfolio.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!userPortfolio || userPortfolio.skills.length === 0) {
      throw ApiError.badRequest('Please add skills to your profile first');
    }

    // Extract user skills
    const userSkills = userPortfolio.skills.map((ps) => ({
      id: ps.skillId,
      name: ps.skill.name,
      proficiency: ps.proficiency,
      yearsOfExperience: ps.yearsOfExperience,
    }));

    const allJobs = await prisma.job.findMany({
      where: { active: true },
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
              },
            },
          },
        },
      },
    });

    // Calculate match scores
    const matchedJobs = allJobs.map((job) => {
      // Get job skills
      const jobSkillIds = job.skills.map((js) => js.skillId);
      const userSkillIds = userSkills.map((us) => us.id);

      // Find matching skills
      const matchingSkills = jobSkillIds.filter((id) =>
        userSkillIds.includes(id)
      );

      // Calculate match percentage
      const matchPercentage =
        jobSkillIds.length > 0
          ? Math.round((matchingSkills.length / jobSkillIds.length) * 100)
          : 0;

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        experience: job.experience,
        salary: job.salary,
        postedDate: job.postedDate,
        matchPercentage,
        recruiter: job.recruiter,
      };
    });

    // Sort by match percentage (highest first)
    matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Get top matches (matches > 50%)
    const topMatches = matchedJobs.filter((job) => job.matchPercentage >= 50);

    // Store matches in database for the user
    await Promise.all(
      topMatches.slice(0, 10).map(async (job) => {
        // Check if match already exists
        const existingMatch = await prisma.match.findUnique({
          where: {
            jobId_candidateId: {
              jobId: job.id,
              candidateId: req.user!.id,
            },
          },
        });

        if (!existingMatch) {
          await prisma.match.create({
            data: {
              jobId: job.id,
              candidateId: req.user!.id,
              matchPercentage: job.matchPercentage,
            },
          });

          // Create notification for job seeker
          await prisma.notification.create({
            data: {
              userId: req.user!.id,
              type: 'job',
              title: 'New Job Match',
              content: `We found a job that matches your skills: ${job.title} at ${job.company}`,
              link: `/jobs/${job.id}`,
              actionText: 'View Job',
            },
          });
        }
      })
    );

    res.status(200).json({
      matches: topMatches,
      totalMatches: topMatches.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search candidates based on query
 * @route POST /api/ai/search-candidates
 */
export const searchCandidates = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    if (req.user.role !== 'RECRUITER' && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('Only recruiters can search candidates');
    }

    const { query, filters } = req.body as MatchQueryDTO;

    // Parse query for skills and experience
    const queryLower = query.toLowerCase();

    // Extract skill keywords from query
    // This is a simplified version - in a real app, you would use NLP
    const skillKeywords = queryLower
      .replace(
        /with|and|or|,|\.|years|experience|developers|developer|engineers|engineer/g,
        ' '
      )
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 2);

    // Build WHERE clause
    let whereClause: any = {
      role: 'JOBSEEKER',
    };

    // Filter by experience years if specified
    if (filters?.experience) {
      whereClause.portfolio = {
        skills: {
          some: {
            yearsOfExperience: {
              gte: filters.experience,
            },
          },
        },
      };
    }

    // Filter by location if specified
    if (filters?.location) {
      whereClause.profile = {
        location: {
          contains: filters.location,
          mode: 'insensitive',
        },
      };
    }

    // Find candidates
    const candidates = await prisma.user.findMany({
      where: whereClause,
      include: {
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
      },
    });

    // Filter and rank by skills mentioned in query
    let rankedCandidates = candidates.map((candidate) => {
      // Get candidate skills
      const candidateSkills =
        candidate.portfolio?.skills.map((ps) => ({
          name: ps.skill.name.toLowerCase(),
          proficiency: ps.proficiency,
          yearsOfExperience: ps.yearsOfExperience,
        })) || [];

      // Count matches with query keywords
      let matchCount = 0;
      const matchedSkills: string[] = [];

      skillKeywords.forEach((keyword) => {
        candidateSkills.forEach((skill) => {
          if (skill.name.includes(keyword)) {
            matchCount++;
            matchedSkills.push(skill.name);
          }
        });
      });

      // Check for specific skills if provided in filters
      let specificSkillsMatch = true;
      if (filters?.skills && filters.skills.length > 0) {
        const candidateSkillNames = candidateSkills.map((s) => s.name);
        specificSkillsMatch = filters.skills.every((skill) =>
          candidateSkillNames.includes(skill.toLowerCase())
        );
      }

      if (!specificSkillsMatch) {
        matchCount = 0; // Disqualify if missing required skills
      }

      // Calculate match score
      const matchScore =
        matchCount > 0 ? (matchCount / skillKeywords.length) * 100 : 0;

      return {
        id: candidate.id,
        name: candidate.name,
        title: candidate.profile?.title || 'Job Seeker',
        location: candidate.profile?.location || 'Unknown',
        skills: candidateSkills,
        matchedSkills,
        matchScore: Math.round(matchScore),
        // Don't include email or other sensitive info
      };
    });

    // Filter out candidates with no matches
    rankedCandidates = rankedCandidates.filter((c) => c.matchScore > 0);

    // Sort by match score
    rankedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      candidates: rankedCandidates,
      totalMatches: rankedCandidates.length,
      query,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get career path recommendations
 * @route POST /api/ai/career-paths
 */
export const getCareerPaths = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('User not authenticated');
    }

    if (req.user.role !== 'JOBSEEKER') {
      throw ApiError.forbidden(
        'Only job seekers can use career path recommendations'
      );
    }

    const { currentSkills, currentRole, yearsOfExperience } =
      req.body as CareerPathDTO;

    // Get additional skills from database if not provided
    let userSkills = currentSkills || [];

    if (!userSkills.length) {
      // Get user's skills from portfolio
      const userPortfolio = await prisma.portfolio.findUnique({
        where: { userId: req.user.id },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (!userPortfolio || userPortfolio.skills.length === 0) {
        throw ApiError.badRequest('Please add skills to your profile first');
      }

      userSkills = userPortfolio.skills.map((ps) => ps.skill.name);
    }

    // Simple career path recommendations
    // This will typically be an API call to an external service

    // Detect user's technical stack
    const hasJavascript = userSkills.some((skill) =>
      ['javascript', 'typescript', 'react', 'angular', 'vue', 'node'].includes(
        skill.toLowerCase()
      )
    );

    const hasPython = userSkills.some((skill) =>
      ['python', 'django', 'flask', 'pandas', 'numpy', 'scipy'].includes(
        skill.toLowerCase()
      )
    );

    const hasData = userSkills.some((skill) =>
      [
        'sql',
        'database',
        'data analysis',
        'data science',
        'machine learning',
      ].includes(skill.toLowerCase())
    );

    const hasDesign = userSkills.some((skill) =>
      ['ui', 'ux', 'design', 'photoshop', 'illustrator', 'figma'].includes(
        skill.toLowerCase()
      )
    );

    // Generate recommendations based on skills
    const careerPaths = [];

    if (hasJavascript) {
      careerPaths.push({
        role: 'Full Stack Developer',
        description:
          'Expand your skills to include both frontend and backend development',
        requiredSkills: [
          'Node.js',
          'Express',
          'Database Design',
          'API Development',
        ],
        matchPercentage: 85,
      });

      careerPaths.push({
        role: 'DevOps Engineer',
        description: 'Learn cloud infrastructure and deployment automation',
        requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS or Azure'],
        matchPercentage: 70,
      });
    }

    if (hasPython) {
      careerPaths.push({
        role: 'Data Scientist',
        description:
          'Apply Python skills to data analysis and machine learning',
        requiredSkills: ['Pandas', 'NumPy', 'Machine Learning', 'Statistics'],
        matchPercentage: 80,
      });

      careerPaths.push({
        role: 'Backend Engineer',
        description: 'Focus on scalable API development with Python',
        requiredSkills: [
          'Django or Flask',
          'RESTful APIs',
          'Database Design',
          'Authentication',
        ],
        matchPercentage: 85,
      });
    }

    if (hasData) {
      careerPaths.push({
        role: 'Data Engineer',
        description: 'Build data pipelines and infrastructure',
        requiredSkills: [
          'SQL',
          'ETL Processes',
          'Big Data Technologies',
          'Cloud Databases',
        ],
        matchPercentage: 90,
      });

      careerPaths.push({
        role: 'Business Intelligence Analyst',
        description: 'Generate insights from business data',
        requiredSkills: [
          'Data Visualization',
          'SQL',
          'Business Analysis',
          'Reporting Tools',
        ],
        matchPercentage: 85,
      });
    }

    if (hasDesign) {
      careerPaths.push({
        role: 'UX/UI Designer',
        description: 'Create user-centered design solutions',
        requiredSkills: [
          'User Research',
          'Wireframing',
          'Prototyping',
          'Design Systems',
        ],
        matchPercentage: 90,
      });

      careerPaths.push({
        role: 'Product Designer',
        description: 'Design end-to-end product experiences',
        requiredSkills: [
          'Design Thinking',
          'Product Strategy',
          'User Testing',
          'Information Architecture',
        ],
        matchPercentage: 80,
      });
    }

    // Default recommendations if none match
    if (careerPaths.length === 0) {
      careerPaths.push({
        role: 'Frontend Developer',
        description: 'Learn modern web development technologies',
        requiredSkills: [
          'HTML/CSS',
          'JavaScript',
          'React or Angular',
          'Responsive Design',
        ],
        matchPercentage: 70,
      });

      careerPaths.push({
        role: 'QA Engineer',
        description: 'Ensure software quality through testing',
        requiredSkills: [
          'Test Planning',
          'Automated Testing',
          'Bug Tracking',
          'Test Frameworks',
        ],
        matchPercentage: 65,
      });
    }

    // Sort by match percentage
    careerPaths.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      careerPaths,
      currentSkills: userSkills,
    });
  } catch (error) {
    next(error);
  }
};
