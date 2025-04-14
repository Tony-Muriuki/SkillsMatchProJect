import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Skill {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  matchPercentage: number;
  salary: string;
  postedDate: string;
  logo: string;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  date: string;
  logo: string;
}

interface CareerSuggestion {
  role: string;
  description: string;
  requiredSkills: string[];
  matchPercentage: number;
}

@Component({
  selector: 'app-job-seeker-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-seeker-dashboard.component.html',
  styleUrl: './job-seeker-dashboard.component.scss',
})
export class JobSeekerDashboardComponent implements OnInit {
  userName = 'John';
  jobTitle = 'Frontend Developer';
  experience = '3 years';
  skills: Skill[] = [];
  recommendedJobs: Job[] = [];
  applications: Application[] = [];
  careerSuggestions: CareerSuggestion[] = [];

  // Dashboard stats
  matchedJobsCount = 24;
  savedJobsCount = 8;
  applicationsCount = 5;
  interviewsCount = 2;

  ngOnInit(): void {
    this.loadUserData();
    this.loadRecommendedJobs();
    this.loadApplications();
    this.loadCareerSuggestions();
  }

  private loadUserData(): void {
    // Mock data - would come from a service
    this.skills = [
      { name: 'HTML', level: 'expert' },
      { name: 'CSS', level: 'expert' },
      { name: 'JavaScript', level: 'advanced' },
      { name: 'TypeScript', level: 'intermediate' },
      { name: 'Angular', level: 'intermediate' },
      { name: 'React', level: 'basic' },
    ];
  }

  private loadRecommendedJobs(): void {
    // Mock data - would come from a service
    this.recommendedJobs = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        matchPercentage: 92,
        salary: '$120K - $150K',
        postedDate: '2 days ago',
        logo: 'assets/logos/techcorp.png',
      },
      {
        id: '2',
        title: 'UI Engineer',
        company: 'DesignMasters',
        location: 'Remote',
        type: 'Full-time',
        matchPercentage: 87,
        salary: '$110K - $130K',
        postedDate: '1 week ago',
        logo: 'assets/logos/designmasters.png',
      },
      {
        id: '3',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'Contract',
        matchPercentage: 84,
        salary: '$100K - $120K',
        postedDate: '3 days ago',
        logo: 'assets/logos/startupxyz.png',
      },
    ];
  }

  private loadApplications(): void {
    // Mock data - would come from a service
    this.applications = [
      {
        id: '1',
        jobTitle: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        stage: 'interview',
        date: '2023-04-05',
        logo: 'assets/logos/techcorp.png',
      },
      {
        id: '2',
        jobTitle: 'UI Engineer',
        company: 'DesignMasters',
        stage: 'screening',
        date: '2023-04-10',
        logo: 'assets/logos/designmasters.png',
      },
      {
        id: '3',
        jobTitle: 'Web Developer',
        company: 'WebSolutions',
        stage: 'applied',
        date: '2023-04-12',
        logo: 'assets/logos/websolutions.png',
      },
    ];
  }

  private loadCareerSuggestions(): void {
    // Mock data - would come from a service
    this.careerSuggestions = [
      {
        role: 'Full Stack Developer',
        description:
          'Expand your backend skills to become a full stack developer',
        requiredSkills: ['Node.js', 'Express', 'MongoDB'],
        matchPercentage: 65,
      },
      {
        role: 'UX/UI Designer',
        description: 'Leverage your frontend skills for UX/UI design roles',
        requiredSkills: ['Figma', 'UX Research', 'UI Design'],
        matchPercentage: 58,
      },
    ];
  }

  getStageClass(stage: string): string {
    switch (stage) {
      case 'applied':
        return 'stage-applied';
      case 'screening':
        return 'stage-screening';
      case 'interview':
        return 'stage-interview';
      case 'offer':
        return 'stage-offer';
      case 'rejected':
        return 'stage-rejected';
      default:
        return '';
    }
  }

  getStageText(stage: string): string {
    switch (stage) {
      case 'applied':
        return 'Applied';
      case 'screening':
        return 'Screening';
      case 'interview':
        return 'Interview';
      case 'offer':
        return 'Offer';
      case 'rejected':
        return 'Rejected';
      default:
        return stage;
    }
  }
}
