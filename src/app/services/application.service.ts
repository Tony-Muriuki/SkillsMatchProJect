// src/app/services/application.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  status: string;
  coverLetter?: string;
  matchPercentage?: number;
  appliedDate: string;
  lastUpdated: string;
}

interface ApplicationResponse {
  message: string;
  application: Application;
}

interface ApplicationsResponse {
  applications: Application[];
  total: number;
}

interface ApplicationStats {
  totalApplied: number;
  inReview: number;
  interviews: number;
  offers: number;
  rejected: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  applyForJob(
    jobId: string,
    applicationData: any
  ): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(
      `${this.env.apiUrl}/applications`,
      {
        jobId,
        ...applicationData,
      }
    );
  }

  getUserApplications(): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(
      `${this.env.apiUrl}/applications`
    );
  }

  getApplicationById(id: string): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(
      `${this.env.apiUrl}/applications/${id}`
    );
  }

  getApplicationStats(): Observable<ApplicationStats> {
    return this.http.get<ApplicationStats>(
      `${this.env.apiUrl}/applications/stats`
    );
  }

  // For recruiters
  getCompanyApplications(): Observable<ApplicationsResponse> {
    return this.http.get<ApplicationsResponse>(
      `${this.env.apiUrl}/applications/company`
    );
  }

  updateApplicationStatus(
    applicationId: string,
    status: string
  ): Observable<ApplicationResponse> {
    return this.http.put<ApplicationResponse>(
      `${this.env.apiUrl}/applications/${applicationId}/status`,
      { status }
    );
  }
}
