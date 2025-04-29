import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface JobPost {
  id: string;
  title: string;
  location: string;
  type: string;
  postedDate: string;
  applicantsCount: number;
  matchedCount: number;
  status: 'active' | 'draft' | 'closed';
}

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  position: string;
  matchPercentage: number;
  status: 'new' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'rejected';
}

interface Interview {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  position: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Message {
  id: string;
  sender: string;
  senderAvatar: string;
  content: string;
  time: string;
  isUnread: boolean;
}

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrl: './recruiter-dashboard.component.scss',
})
export class RecruiterDashboardComponent implements OnInit {
  userName = 'Sarah'; // Default name, will be updated
  companyName = 'TechCorp Inc.';

  // Dashboard stats
  activeJobsCount = 4;
  candidatesCount = 38;
  interviewsCount = 5;
  averageMatchScore = 84;

  // Dashboard data
  activeJobs: JobPost[] = [];
  candidates: Candidate[] = [];
  upcomingInterviews: Interview[] = [];
  recentMessages: Message[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Get user info from auth service
    const currentUser = this.authService.getStoredUser();
    if (currentUser) {
      this.userName = currentUser.firstName || this.userName;
      this.companyName = currentUser.companyName || this.companyName;
    } else {
      // Try to load the current user if not available
      this.authService.getCurrentUser().subscribe({
        next: (user) => {
          if (user) {
            this.userName = user.firstName || this.userName;
            this.companyName = user.companyName || this.companyName;
          }
        },
        error: (err) => {
          console.error('Error loading user data:', err);
        },
      });
    }

    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Mock data - would come from a service
    this.loadActiveJobs();
    this.loadCandidates();
    this.loadUpcomingInterviews();
    this.loadRecentMessages();
  }

  private loadActiveJobs(): void {
    this.activeJobs = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        location: 'San Francisco, CA',
        type: 'Full-time',
        postedDate: '2023-04-02',
        applicantsCount: 18,
        matchedCount: 12,
        status: 'active',
      },
      {
        id: '2',
        title: 'UX Designer',
        location: 'Remote',
        type: 'Full-time',
        postedDate: '2023-04-05',
        applicantsCount: 15,
        matchedCount: 10,
        status: 'active',
      },
      {
        id: '3',
        title: 'Backend Developer',
        location: 'New York, NY',
        type: 'Full-time',
        postedDate: '2023-04-10',
        applicantsCount: 5,
        matchedCount: 3,
        status: 'active',
      },
      {
        id: '4',
        title: 'Product Manager',
        location: 'San Francisco, CA',
        type: 'Full-time',
        postedDate: '2023-04-12',
        applicantsCount: 0,
        matchedCount: 0,
        status: 'active',
      },
    ];
  }

  private loadCandidates(): void {
    this.candidates = [
      {
        id: '1',
        name: 'John Smith',
        avatar: 'assets/avatars/user1.jpg',
        position: 'Senior Frontend Developer',
        matchPercentage: 92,
        status: 'interview',
      },
      {
        id: '2',
        name: 'Emily Johnson',
        avatar: 'assets/avatars/user2.jpg',
        position: 'UX Designer',
        matchPercentage: 88,
        status: 'reviewing',
      },
      {
        id: '3',
        name: 'Michael Brown',
        avatar: 'assets/avatars/user3.jpg',
        position: 'Backend Developer',
        matchPercentage: 85,
        status: 'new',
      },
      {
        id: '4',
        name: 'Jessica Lee',
        avatar: 'assets/avatars/user4.jpg',
        position: 'Senior Frontend Developer',
        matchPercentage: 80,
        status: 'new',
      },
    ];
  }

  private loadUpcomingInterviews(): void {
    this.upcomingInterviews = [
      {
        id: '1',
        candidateName: 'John Smith',
        candidateAvatar: 'assets/avatars/user1.jpg',
        position: 'Senior Frontend Developer',
        date: '2023-04-20',
        time: '10:00 AM',
        status: 'scheduled',
      },
      {
        id: '2',
        candidateName: 'Emily Johnson',
        candidateAvatar: 'assets/avatars/user2.jpg',
        position: 'UX Designer',
        date: '2023-04-21',
        time: '2:00 PM',
        status: 'scheduled',
      },
      {
        id: '3',
        candidateName: 'David Wilson',
        candidateAvatar: 'assets/avatars/user5.jpg',
        position: 'Frontend Developer',
        date: '2023-04-19',
        time: '11:30 AM',
        status: 'completed',
      },
    ];
  }

  private loadRecentMessages(): void {
    this.recentMessages = [
      {
        id: '1',
        sender: 'John Smith',
        senderAvatar: 'assets/avatars/user1.jpg',
        content:
          'Thank you for scheduling the interview. Looking forward to it!',
        time: '10 mins ago',
        isUnread: true,
      },
      {
        id: '2',
        sender: 'Emily Johnson',
        senderAvatar: 'assets/avatars/user2.jpg',
        content:
          'I have some questions about the UX Designer role. Can we discuss?',
        time: '1 hour ago',
        isUnread: true,
      },
      {
        id: '3',
        sender: 'Michael Brown',
        senderAvatar: 'assets/avatars/user3.jpg',
        content:
          "I've submitted my availability for the interview as requested.",
        time: '2 hours ago',
        isUnread: false,
      },
    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'new':
        return 'status-new';
      case 'reviewing':
        return 'status-reviewing';
      case 'interview':
        return 'status-interview';
      case 'offer':
        return 'status-offer';
      case 'hired':
        return 'status-hired';
      case 'rejected':
        return 'status-rejected';
      case 'active':
        return 'status-active';
      case 'draft':
        return 'status-draft';
      case 'closed':
        return 'status-closed';
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
