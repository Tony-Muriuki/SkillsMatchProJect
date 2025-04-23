// src/app/services/interview.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  recruiterId: string;
  jobId: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
}

interface InterviewResponse {
  message: string;
  interview: Interview;
}

interface InterviewsResponse {
  interviews: Interview[];
}

@Injectable({
  providedIn: 'root',
})
export class InterviewService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  scheduleInterview(interviewData: any): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(
      `${this.env.apiUrl}/interviews`,
      interviewData
    );
  }

  getInterviews(): Observable<InterviewsResponse> {
    return this.http.get<InterviewsResponse>(`${this.env.apiUrl}/interviews`);
  }

  updateInterview(
    interviewId: string,
    interviewData: any
  ): Observable<InterviewResponse> {
    return this.http.put<InterviewResponse>(
      `${this.env.apiUrl}/interviews/${interviewId}`,
      interviewData
    );
  }

  cancelInterview(interviewId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.env.apiUrl}/interviews/${interviewId}`
    );
  }
}
