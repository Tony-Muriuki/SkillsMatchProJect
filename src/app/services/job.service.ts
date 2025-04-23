// src/app/services/job.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline?: string;
  matchPercentage?: number;
  isSaved?: boolean;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

interface JobResponse {
  job: Job;
}

interface ApiResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class JobService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getJobs(filters?: any): Observable<JobsResponse> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.jobType && filters.jobType.length)
        params = params.set('jobType', filters.jobType.join(','));
      if (filters.category && filters.category.length)
        params = params.set('category', filters.category.join(','));
      if (filters.experience && filters.experience.length)
        params = params.set('experience', filters.experience.join(','));
      if (filters.salary && filters.salary.length)
        params = params.set('salary', filters.salary.join(','));
    }

    return this.http.get<JobsResponse>(`${this.env.apiUrl}/jobs`, { params });
  }

  getJobById(id: string): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.env.apiUrl}/jobs/${id}`);
  }

  getRecommendedJobs(): Observable<JobsResponse> {
    return this.http.get<JobsResponse>(`${this.env.apiUrl}/jobs/recommended`);
  }

  getSimilarJobs(jobId: string): Observable<JobsResponse> {
    return this.http.get<JobsResponse>(
      `${this.env.apiUrl}/jobs/similar/${jobId}`
    );
  }

  saveJob(jobId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.env.apiUrl}/jobs/saved/${jobId}`,
      {}
    );
  }

  unsaveJob(jobId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.env.apiUrl}/jobs/saved/${jobId}`
    );
  }

  getSavedJobs(): Observable<JobsResponse> {
    return this.http.get<JobsResponse>(`${this.env.apiUrl}/jobs/saved`);
  }

  // For recruiters
  getCompanyJobs(): Observable<JobsResponse> {
    return this.http.get<JobsResponse>(`${this.env.apiUrl}/jobs/company`);
  }

  createJob(jobData: any): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.env.apiUrl}/jobs`, jobData);
  }

  updateJob(jobId: string, jobData: any): Observable<JobResponse> {
    return this.http.put<JobResponse>(
      `${this.env.apiUrl}/jobs/${jobId}`,
      jobData
    );
  }

  deleteJob(jobId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.env.apiUrl}/jobs/${jobId}`);
  }
}
