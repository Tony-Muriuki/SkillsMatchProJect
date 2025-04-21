import { Role, User } from '@prisma/client';
import { Request } from 'express';

// Auth types
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  adminCode?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName?: string;
  jobTitle?: string;
}

// Job types
export interface JobFilter {
  search?: string;
  location?: string;
  type?: string | string[];
  category?: string | string[];
  experience?: string | string[];
  salary?: string | string[];
  page?: number;
  limit?: number;
}

export interface CreateJobDTO {
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  category?: string;
  experience?: string;
  salary?: string;
  deadline?: Date;
  skills: Array<{
    name: string;
    importance: number;
  }>;
}

// Portfolio types
export interface SkillDTO {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years: number;
}

export interface EducationDTO {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface ExperienceDTO {
  company: string;
  title: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface ProjectDTO {
  name: string;
  description?: string;
  url?: string;
  technologies?: string[];
}

export interface PortfolioDTO {
  summary?: string;
  skills?: SkillDTO[];
  education?: EducationDTO[];
  experience?: ExperienceDTO[];
  projects?: ProjectDTO[];
}

// Application types
export interface ApplicationDTO {
  jobId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusDTO {
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
}

// Chat types
export interface MessageDTO {
  receiverId: string;
  content: string;
}

// Notification types
export interface NotificationFilter {
  type?: string;
  isRead?: boolean;
}

// AI types
export interface MatchQueryDTO {
  query: string;
  filters?: {
    experience?: number;
    location?: string;
    skills?: string[];
  };
}

export interface CareerPathDTO {
  currentSkills: string[];
  currentRole?: string;
  yearsOfExperience?: number;
}
