import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../services/notification.service';

interface Notification {
  id: number;
  type: 'job' | 'message' | 'profile' | 'application' | 'interview' | 'system';
  title: string;
  content: string;
  date: string;
  time: string;
  isRead: boolean;
  link?: string;
  actionText?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeFilter: 'all' | 'unread' | 'job' | 'application' | 'message' = 'all';
  isLoading = true;
  error: string = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (response) => {
        // Transform API response to match expected UI format
        this.notifications = response.notifications.map((notification) =>
          this.transformNotification(notification)
        );
        this.filterNotifications(this.activeFilter);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.error = err.error?.message || 'Failed to load notifications.';
        this.isLoading = false;

        // Fallback to mock data
        this.notifications = this.getMockNotifications();
        this.filterNotifications(this.activeFilter);
      },
    });
  }

  transformNotification(apiNotification: any): Notification {
    // Transform API notification to UI model
    // Format date and time from API timestamp
    const date = new Date(apiNotification.createdAt || new Date());

    return {
      id: apiNotification.id,
      type: apiNotification.type as
        | 'job'
        | 'message'
        | 'profile'
        | 'application'
        | 'interview'
        | 'system',
      title: apiNotification.title,
      content: apiNotification.content,
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: apiNotification.isRead,
      link: apiNotification.link,
      actionText: apiNotification.actionText,
    };
  }

  getMockNotifications(): Notification[] {
    // Fallback to mock data
    return [
      {
        id: 1,
        type: 'job',
        title: 'New Job Match',
        content:
          'We found a new job that matches your skills: "Senior Frontend Developer" at TechCorp Inc.',
        date: '2023-04-15',
        time: '10:30 AM',
        isRead: false,
        link: '/jobs/1',
        actionText: 'View Job',
      },
      // ... other mock notifications
    ];
  }

  getUnreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead)
      .length;
  }

  filterNotifications(
    filter: 'all' | 'unread' | 'job' | 'application' | 'message'
  ): void {
    this.activeFilter = filter;

    if (filter === 'all') {
      this.filteredNotifications = [...this.notifications];
    } else if (filter === 'unread') {
      this.filteredNotifications = this.notifications.filter(
        (notification) => !notification.isRead
      );
    } else {
      this.filteredNotifications = this.notifications.filter((notification) => {
        if (filter === 'application') {
          return (
            notification.type === 'application' ||
            notification.type === 'interview'
          );
        }
        return notification.type === filter;
      });
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    // Optimistically update UI
    notification.isRead = true;

    this.notificationService.markAsRead(notification.id).subscribe({
      error: (err) => {
        console.error('Error marking notification as read:', err);
        // Revert on error
        notification.isRead = false;
      },
    });
  }

  markAllAsRead(): void {
    // Optimistically update UI
    const unreadNotifications = this.notifications.filter((n) => !n.isRead);
    unreadNotifications.forEach((notification) => {
      notification.isRead = true;
    });

    this.notificationService.markAllAsRead().subscribe({
      error: (err) => {
        console.error('Error marking all notifications as read:', err);
        // Revert on error
        unreadNotifications.forEach((notification) => {
          notification.isRead = false;
        });
      },
    });

    this.filterNotifications(this.activeFilter);
  }

  deleteNotification(id: number): void {
    // Optimistically update UI
    const originalNotifications = [...this.notifications];
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
    this.filterNotifications(this.activeFilter);

    this.notificationService.deleteNotification(id).subscribe({
      error: (err) => {
        console.error('Error deleting notification:', err);
        // Revert on error
        this.notifications = originalNotifications;
        this.filterNotifications(this.activeFilter);
      },
    });
  }

  clearAllNotifications(): void {
    // Optimistically update UI
    const originalNotifications = [...this.notifications];
    this.notifications = [];
    this.filterNotifications(this.activeFilter);

    this.notificationService.clearAllNotifications().subscribe({
      error: (err) => {
        console.error('Error clearing notifications:', err);
        // Revert on error
        this.notifications = originalNotifications;
        this.filterNotifications(this.activeFilter);
      },
    });
  }

  getNotificationIcon(type: string): string {
    // Preserve existing icon logic
    switch (type) {
      case 'job':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        `;
      // ... other cases
      default:
        return '';
    }
  }

  getNotificationClass(type: string): string {
    // Preserve existing class logic
    switch (type) {
      case 'job':
        return 'notification-job';
      // ... other cases
      default:
        return '';
    }
  }
}
