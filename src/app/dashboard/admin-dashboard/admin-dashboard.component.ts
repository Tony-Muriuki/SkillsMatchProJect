import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  adminName = ''; // Added adminName property for welcome message

  // Dashboard stats
  totalUsers = 15482;
  activeJobs = 1247;
  matchAccuracy = 94.5;
  totalRevenue = 256789;

  // Monthly users data
  monthlyUsersData = [
    { month: 'Jan', jobSeekers: 423, recruiters: 87 },
    { month: 'Feb', jobSeekers: 520, recruiters: 95 },
    { month: 'Mar', jobSeekers: 620, recruiters: 110 },
    { month: 'Apr', jobSeekers: 720, recruiters: 130 },
    { month: 'May', jobSeekers: 820, recruiters: 140 },
    { month: 'Jun', jobSeekers: 920, recruiters: 150 },
    { month: 'Jul', jobSeekers: 1020, recruiters: 160 },
    { month: 'Aug', jobSeekers: 1150, recruiters: 180 },
    { month: 'Sep', jobSeekers: 1300, recruiters: 200 },
    { month: 'Oct', jobSeekers: 1450, recruiters: 220 },
    { month: 'Nov', jobSeekers: 1600, recruiters: 240 },
    { month: 'Dec', jobSeekers: 1750, recruiters: 260 },
  ];

  // Job categories data
  jobCategoriesData = [
    { category: 'Software Development', count: 432 },
    { category: 'Data Science', count: 287 },
    { category: 'Design', count: 195 },
    { category: 'Marketing', count: 154 },
    { category: 'Sales', count: 123 },
    { category: 'Customer Service', count: 87 },
    { category: 'Finance', count: 65 },
    { category: 'HR', count: 45 },
  ];

  // System alerts
  systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'High server load',
      description: 'The server load is currently at 85% capacity.',
      time: '10 minutes ago',
    },
    {
      id: 2,
      type: 'info',
      title: 'Database backup completed',
      description: 'Daily database backup completed successfully.',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'success',
      title: 'System update',
      description: 'System has been updated to version 2.3.4.',
      time: '3 hours ago',
    },
    {
      id: 4,
      type: 'error',
      title: 'API error',
      description: 'External payment API experiencing intermittent issues.',
      time: '5 hours ago',
    },
  ];

  // Recent activities
  recentActivities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'created a new job post',
      target: 'Senior Frontend Developer',
      time: '5 minutes ago',
    },
    {
      id: 2,
      user: 'Emily Johnson',
      action: 'updated their profile',
      target: '',
      time: '15 minutes ago',
    },
    {
      id: 3,
      user: 'TechCorp Inc.',
      action: 'started subscription',
      target: 'Enterprise Plan',
      time: '1 hour ago',
    },
    {
      id: 4,
      user: 'Michael Brown',
      action: 'applied to',
      target: '5 jobs',
      time: '2 hours ago',
    },
    {
      id: 5,
      user: 'Sarah Wilson',
      action: 'completed interview with',
      target: 'Alex Johnson',
      time: '3 hours ago',
    },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get admin info from auth service
    const currentUser = this.authService.getStoredUser();
    if (currentUser) {
      this.adminName = currentUser.firstName || 'Admin';
    } else {
      // Try to load the current user if not available
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          if (user) {
            this.adminName = user.firstName || 'Admin';
          }
        },
        error: (err) => {
          console.error('Error loading user data:', err);
        },
      });
    }

    // Initialize chart data - would be implemented with a chart library
    this.initializeCharts();
  }

  private initializeCharts(): void {
    // Mock implementation - would typically use a chart library like chart.js
    console.log('Initializing charts with data:', {
      users: this.monthlyUsersData,
      categories: this.jobCategoriesData,
    });

    // real implementation, we would initialize charts here
    // Example with chart.js (not actual implementation):
    /*
    const userCtx = document.getElementById('userChart');
    new Chart(userCtx, {
      type: 'line',
      data: {
        labels: this.monthlyUsersData.map(d => d.month),
        datasets: [
          {
            label: 'Job Seekers',
            data: this.monthlyUsersData.map(d => d.jobSeekers),
            // styling properties
          },
          {
            label: 'Recruiters',
            data: this.monthlyUsersData.map(d => d.recruiters),
            // styling properties
          }
        ]
      },
      options: {
        // chart options
      }
    });
    */
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      default:
        return '';
    }
  }

  formatCurrency(value: number): string {
    return `+${value.toLocaleString('en-US')}`;
  }
}
