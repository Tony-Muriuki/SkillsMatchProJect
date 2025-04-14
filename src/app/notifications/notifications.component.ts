import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    // Simulate API call
    setTimeout(() => {
      this.notifications = this.getMockNotifications();
      this.filterNotifications(this.activeFilter);
      this.isLoading = false;
    }, 1000);
  }

  getMockNotifications(): Notification[] {
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
      {
        id: 2,
        type: 'application',
        title: 'Application Status Update',
        content:
          'Your application for "UX Designer" at DesignMasters has been reviewed. You have been selected for an interview.',
        date: '2023-04-14',
        time: '03:45 PM',
        isRead: false,
        link: '/dashboard/job-seeker',
        actionText: 'View Applications',
      },
      {
        id: 3,
        type: 'message',
        title: 'New Message',
        content:
          'You have received a new message from Sarah Wilson at TechCorp Inc. regarding your application.',
        date: '2023-04-14',
        time: '01:20 PM',
        isRead: true,
        link: '/chat',
        actionText: 'Read Message',
      },
      {
        id: 4,
        type: 'interview',
        title: 'Interview Scheduled',
        content:
          'Your interview for "UX Designer" at DesignMasters has been scheduled for April 20, 2023 at 2:00 PM.',
        date: '2023-04-13',
        time: '11:15 AM',
        isRead: true,
        link: '/dashboard/job-seeker',
        actionText: 'View Details',
      },
      {
        id: 5,
        type: 'profile',
        title: 'Profile Update Reminder',
        content:
          'Your profile is 75% complete. Add more details to increase your chances of finding the perfect job.',
        date: '2023-04-12',
        time: '09:00 AM',
        isRead: true,
        link: '/profile',
        actionText: 'Update Profile',
      },
      {
        id: 6,
        type: 'system',
        title: 'Account Security',
        content:
          'We have detected a new login to your account from a new device. If this was you, you can ignore this message.',
        date: '2023-04-10',
        time: '08:30 PM',
        isRead: true,
      },
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
    // In a real app, would call a service to update the notification status
    notification.isRead = true;
  }

  markAllAsRead(): void {
    // In a real app, would call a service to update all notifications
    this.notifications.forEach((notification) => {
      notification.isRead = true;
    });
    this.filterNotifications(this.activeFilter);
  }

  deleteNotification(id: number): void {
    // In a real app, would call a service to delete the notification
    this.notifications = this.notifications.filter(
      (notification) => notification.id !== id
    );
    this.filterNotifications(this.activeFilter);
  }

  clearAllNotifications(): void {
    // In a real app, would call a service to clear all notifications
    this.notifications = [];
    this.filterNotifications(this.activeFilter);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'job':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        `;
      case 'message':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      case 'profile':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
      case 'application':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        `;
      case 'interview':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        `;
      case 'system':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `;
      default:
        return '';
    }
  }

  getNotificationClass(type: string): string {
    switch (type) {
      case 'job':
        return 'notification-job';
      case 'message':
        return 'notification-message';
      case 'profile':
        return 'notification-profile';
      case 'application':
        return 'notification-application';
      case 'interview':
        return 'notification-interview';
      case 'system':
        return 'notification-system';
      default:
        return '';
    }
  }
}
