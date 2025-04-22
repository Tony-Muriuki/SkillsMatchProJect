import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.jobSkill.deleteMany();
  await prisma.portfolioSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.education.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.project.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await hashPassword('admin12345');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillmatch.ai',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      profile: {
        create: {
          title: 'System Administrator',
          bio: 'SkillMatch AI platform administrator',
        },
      },
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create recruiter user
  console.log('Creating recruiter user...');
  const recruiterPassword = await hashPassword('recruiter12345');

  const recruiter = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.com',
      password: recruiterPassword,
      name: 'Sarah Wilson',
      role: Role.RECRUITER,
      profile: {
        create: {
          title: 'HR Manager',
          company: 'TechCorp Inc.',
          bio: 'Experienced HR manager looking for talented individuals',
          location: 'San Francisco, CA',
        },
      },
    },
  });

  console.log(`Created recruiter user: ${recruiter.email}`);

  // Create job seeker user
  console.log('Creating job seeker user...');
  const jobSeekerPassword = await hashPassword('jobseeker12345');

  const jobSeeker = await prisma.user.create({
    data: {
      email: 'jobseeker@example.com',
      password: jobSeekerPassword,
      name: 'John Smith',
      role: Role.JOBSEEKER,
      profile: {
        create: {
          title: 'Frontend Developer',
          bio: 'Passionate developer with 3 years of experience',
          location: 'New York, NY',
        },
      },
    },
  });

  console.log(`Created job seeker user: ${jobSeeker.email}`);

  // Create portfolio for job seeker
  console.log('Creating portfolio for job seeker...');
  const portfolio = await prisma.portfolio.create({
    data: {
      userId: jobSeeker.id,
      summary:
        'Experienced frontend developer with a passion for creating user-friendly interfaces.',
    },
  });

  // Create skills
  console.log('Creating skills...');
  const skills = await Promise.all([
    // Programming Languages
    prisma.skill.create({
      data: { name: 'JavaScript', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'TypeScript', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'Python', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'Java', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'C#', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'PHP', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'Ruby', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'Go', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'Swift', category: 'Programming Languages' },
    }),
    prisma.skill.create({
      data: { name: 'Kotlin', category: 'Programming Languages' },
    }),

    // Frontend
    prisma.skill.create({ data: { name: 'HTML', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'CSS', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'React', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Angular', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Vue.js', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Redux', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'SCSS/SASS', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Webpack', category: 'Frontend' } }),
    prisma.skill.create({
      data: { name: 'Responsive Design', category: 'Frontend' },
    }),

    // Backend
    prisma.skill.create({ data: { name: 'Node.js', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Express', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Django', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Flask', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Spring Boot', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'ASP.NET', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Laravel', category: 'Backend' } }),
    prisma.skill.create({
      data: { name: 'Ruby on Rails', category: 'Backend' },
    }),

    // Database
    prisma.skill.create({ data: { name: 'SQL', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'PostgreSQL', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'MySQL', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'MongoDB', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'Redis', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'Firebase', category: 'Database' } }),
    prisma.skill.create({
      data: { name: 'Elasticsearch', category: 'Database' },
    }),

    // DevOps & Cloud
    prisma.skill.create({ data: { name: 'Docker', category: 'DevOps' } }),
    prisma.skill.create({ data: { name: 'Kubernetes', category: 'DevOps' } }),
    prisma.skill.create({ data: { name: 'AWS', category: 'Cloud' } }),
    prisma.skill.create({ data: { name: 'Azure', category: 'Cloud' } }),
    prisma.skill.create({ data: { name: 'Google Cloud', category: 'Cloud' } }),
    prisma.skill.create({ data: { name: 'CI/CD', category: 'DevOps' } }),
    prisma.skill.create({ data: { name: 'Jenkins', category: 'DevOps' } }),
    prisma.skill.create({ data: { name: 'Git', category: 'DevOps' } }),

    // Data Science
    prisma.skill.create({
      data: { name: 'Machine Learning', category: 'Data Science' },
    }),
    prisma.skill.create({
      data: { name: 'Data Analysis', category: 'Data Science' },
    }),
    prisma.skill.create({
      data: { name: 'TensorFlow', category: 'Data Science' },
    }),
    prisma.skill.create({
      data: { name: 'PyTorch', category: 'Data Science' },
    }),
    prisma.skill.create({ data: { name: 'Pandas', category: 'Data Science' } }),
    prisma.skill.create({ data: { name: 'NumPy', category: 'Data Science' } }),
    prisma.skill.create({ data: { name: 'R', category: 'Data Science' } }),

    // Design
    prisma.skill.create({ data: { name: 'UI Design', category: 'Design' } }),
    prisma.skill.create({ data: { name: 'UX Design', category: 'Design' } }),
    prisma.skill.create({ data: { name: 'Figma', category: 'Design' } }),
    prisma.skill.create({ data: { name: 'Adobe XD', category: 'Design' } }),
    prisma.skill.create({ data: { name: 'Photoshop', category: 'Design' } }),
    prisma.skill.create({ data: { name: 'Illustrator', category: 'Design' } }),

    // Soft Skills
    prisma.skill.create({
      data: { name: 'Project Management', category: 'Soft Skills' },
    }),
    prisma.skill.create({
      data: { name: 'Communication', category: 'Soft Skills' },
    }),
    prisma.skill.create({
      data: { name: 'Leadership', category: 'Soft Skills' },
    }),
    prisma.skill.create({
      data: { name: 'Problem Solving', category: 'Soft Skills' },
    }),
    prisma.skill.create({
      data: { name: 'Teamwork', category: 'Soft Skills' },
    }),
    prisma.skill.create({ data: { name: 'Agile', category: 'Soft Skills' } }),
    prisma.skill.create({ data: { name: 'Scrum', category: 'Soft Skills' } }),
  ]);

  console.log(`Created ${skills.length} skills`);

  // Add skills to job seeker portfolio
  console.log('Adding skills to job seeker portfolio...');
  const jobSeekerSkills = [
    { name: 'JavaScript', level: 5, years: 3 },
    { name: 'TypeScript', level: 4, years: 2 },
    { name: 'React', level: 4, years: 2 },
    { name: 'HTML', level: 5, years: 3 },
    { name: 'CSS', level: 5, years: 3 },
    { name: 'Node.js', level: 3, years: 1 },
    { name: 'Git', level: 4, years: 3 },
  ];

  for (const skillData of jobSeekerSkills) {
    const skill = skills.find((s) => s.name === skillData.name);
    if (skill) {
      await prisma.portfolioSkill.create({
        data: {
          portfolioId: portfolio.id,
          skillId: skill.id,
          proficiency: skillData.level,
          yearsOfExperience: skillData.years,
        },
      });
    }
  }

  // Add education to job seeker portfolio
  console.log('Adding education to job seeker portfolio...');
  await prisma.education.create({
    data: {
      portfolioId: portfolio.id,
      school: 'University of New York',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: new Date('2017-09-01'),
      endDate: new Date('2021-05-31'),
      current: false,
    },
  });

  // Add experience to job seeker portfolio
  console.log('Adding experience to job seeker portfolio...');
  await prisma.experience.create({
    data: {
      portfolioId: portfolio.id,
      company: 'WebTech Solutions',
      title: 'Junior Frontend Developer',
      location: 'New York, NY',
      description:
        'Developed responsive web applications using React and TypeScript. Collaborated with UX designers and backend developers.',
      startDate: new Date('2021-06-01'),
      endDate: null,
      current: true,
    },
  });

  // Add project to job seeker portfolio
  console.log('Adding project to job seeker portfolio...');
  await prisma.project.create({
    data: {
      portfolioId: portfolio.id,
      title: 'E-commerce Dashboard',
      description:
        'A responsive dashboard for e-commerce analytics with charts and data visualization.',
      projectUrl: 'https://github.com/johnsmith/ecommerce-dashboard',
      technologies: 'React, TypeScript, Chart.js, SCSS',
    },
  });

  // Create job postings
  console.log('Creating job postings...');
  const jobs = [
    {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'Software Development',
      experience: 'Senior Level',
      salary: '$120K - $150K',
      description: `
        We are looking for a skilled Senior Frontend Developer to join our team at TechCorp Inc. 
        You will be responsible for building and maintaining user interfaces for our web applications, 
        ensuring high-quality user experiences across all devices.
        
        As a Senior Frontend Developer, you will work closely with our design and backend teams to implement
        responsive and interactive features using modern web technologies. You should have a strong understanding
        of frontend frameworks, performance optimization, and accessibility standards.
      `,
      recruiterId: recruiter.id,
      skills: [
        'JavaScript',
        'TypeScript',
        'React',
        'HTML',
        'CSS',
        'Redux',
        'Git',
      ],
    },
    {
      title: 'Backend Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'Software Development',
      experience: 'Mid Level',
      salary: '$100K - $130K',
      description: `
        We're looking for a Backend Engineer to join our team and help build scalable and maintainable
        services. You will be working on designing and implementing APIs, managing databases, and ensuring
        system performance and reliability.
        
        You should have strong problem-solving skills and experience with modern backend technologies.
      `,
      recruiterId: recruiter.id,
      skills: [
        'Node.js',
        'Express',
        'PostgreSQL',
        'RESTful APIs',
        'AWS',
        'Docker',
      ],
    },
    {
      title: 'UX/UI Designer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      type: 'Full-time',
      category: 'Design',
      experience: 'Mid Level',
      salary: '$90K - $110K',
      description: `
        Join our growing design team to create exceptional user experiences for our products.
        You will be responsible for designing user interfaces, creating wireframes and prototypes,
        and collaborating with developers to implement your designs.
        
        You should have a strong portfolio demonstrating your design skills and user-centered approach.
      `,
      recruiterId: recruiter.id,
      skills: [
        'UI Design',
        'UX Design',
        'Figma',
        'Adobe XD',
        'Responsive Design',
      ],
    },
  ];

  for (const jobData of jobs) {
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        type: jobData.type,
        category: jobData.category,
        experience: jobData.experience,
        salary: jobData.salary,
        description: jobData.description,
        recruiterId: jobData.recruiterId,
        active: true,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Add skills to job
    for (const skillName of jobData.skills) {
      const skill = skills.find((s) => s.name === skillName);
      if (skill) {
        await prisma.jobSkill.create({
          data: {
            jobId: job.id,
            skillId: skill.id,
            importance: 4, // High importance
          },
        });
      }
    }
  }

  console.log(`Created ${jobs.length} job postings`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
