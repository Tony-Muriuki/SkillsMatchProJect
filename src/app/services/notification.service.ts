// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  date: string;
  time: string;
  isRead: boolean;
  link?: string;
  actionText?: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

interface UnreadCountResponse {
  count: number;
}

interface ApiResponse {
  message: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(
      `${this.env.apiUrl}/notifications`
    );
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(
      `${this.env.apiUrl}/notifications/unread`
    );
  }

  markAsRead(notificationId: number): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.env.apiUrl}/notifications/${notificationId}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${this.env.apiUrl}/notifications/read-all`,
      {}
    );
  }

  deleteNotification(notificationId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.env.apiUrl}/notifications/${notificationId}`
    );
  }

  clearAllNotifications(): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.env.apiUrl}/notifications`);
  }
}
