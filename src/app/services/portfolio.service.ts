// src/app/services/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface Skill {
  name: string;
  level: string;
  years: number;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Experience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface Project {
  name: string;
  description?: string;
  url?: string;
  technologies: string[];
}

interface Portfolio {
  skills?: Skill[];
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  summary?: string;
}

interface PortfolioResponse {
  message?: string;
  portfolio?: Portfolio;
}

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getPortfolio(): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.env.apiUrl}/portfolios`);
  }

  updatePortfolio(portfolioData: Portfolio): Observable<PortfolioResponse> {
    return this.http.put<PortfolioResponse>(
      `${this.env.apiUrl}/portfolios`,
      portfolioData
    );
  }

  updateSkills(skills: Skill[]): Observable<PortfolioResponse> {
    return this.http.put<PortfolioResponse>(
      `${this.env.apiUrl}/portfolios/skills`,
      { skills }
    );
  }

  updateEducation(education: Education[]): Observable<PortfolioResponse> {
    return this.http.put<PortfolioResponse>(
      `${this.env.apiUrl}/portfolios/education`,
      { education }
    );
  }

  updateExperience(experience: Experience[]): Observable<PortfolioResponse> {
    return this.http.put<PortfolioResponse>(
      `${this.env.apiUrl}/portfolios/experience`,
      { experience }
    );
  }

  updateProjects(projects: Project[]): Observable<PortfolioResponse> {
    return this.http.put<PortfolioResponse>(
      `${this.env.apiUrl}/portfolios/projects`,
      { projects }
    );
  }
}
