// src/app/services/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  matchAccuracy: number;
  totalRevenue: number;
  monthlyUsersData: any[];
  jobCategoriesData: any[];
}

interface SystemAlert {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
}

interface AdminStatsResponse {
  stats: DashboardStats;
  alerts: SystemAlert[];
  activities: RecentActivity[];
}

interface UsersResponse {
  users: any[];
  total: number;
}

interface JobsResponse {
  jobs: any[];
  total: number;
}

interface ApiResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getDashboardStats(): Observable<AdminStatsResponse> {
    return this.http.get<AdminStatsResponse>(`${this.env.apiUrl}/admin/stats`);
  }

  getRecentActivities(): Observable<{ activities: RecentActivity[] }> {
    return this.http.get<{ activities: RecentActivity[] }>(
      `${this.env.apiUrl}/admin/users/recent`
    );
  }

  getSystemAlerts(): Observable<{ alerts: SystemAlert[] }> {
    return this.http.get<{ alerts: SystemAlert[] }>(
      `${this.env.apiUrl}/admin/system/alerts`
    );
  }

  getAllUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.env.apiUrl}/admin/users`);
  }

  deleteUser(userId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.env.apiUrl}/admin/users/${userId}`
    );
  }

  getAllJobs(): Observable<JobsResponse> {
    return this.http.get<JobsResponse>(`${this.env.apiUrl}/admin/jobs`);
  }

  updateJobStatus(jobId: string, status: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.env.apiUrl}/admin/jobs/${jobId}/status`,
      { status }
    );
  }
}
