import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { ApplicationService } from '../../services/application.service';

interface JobDetail {
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
  matchPercentage: number;
  skillMatch: {
    skill: string;
    level: number;
  }[];
  postedDate: string;
  deadline: string;
  companyInfo: {
    logo: string;
    description: string;
    website: string;
    employees: string;
    industry: string;
    founded: string;
  };
  isSaved: boolean;
}

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss',
})
export class JobDetailsComponent implements OnInit {
  jobId: string = '';
  job: JobDetail | null = null;
  isLoading = true;
  activeTab: 'description' | 'company' | 'match' = 'description';
  coverLetter: string = '';
  showApplication = false;
  applicationSubmitted = false;
  similarJobs: any[] = [];
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.jobId = id;
        this.loadJobDetails();
      }
    });
  }

  loadJobDetails(): void {
    this.isLoading = true;
    this.jobService.getJobById(this.jobId).subscribe({
      next: (response) => {
        // Transform API response to match expected UI format
        this.job = this.transformJobData(response.job);
        this.loadSimilarJobs();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading job details:', err);
        this.error = err.error?.message || 'Failed to load job details.';
        this.isLoading = false;

        // Fallback to mock data if API fails
        this.job = this.getMockJobDetail();
        this.loadSimilarJobs();
      },
    });
  }

  transformJobData(apiJob: any): JobDetail {
    // In a real app, you'd transform the API response to match your UI model
    // This is just an example
    return {
      id: apiJob.id,
      title: apiJob.title,
      company: apiJob.company,
      location: apiJob.location,
      type: apiJob.type,
      category: apiJob.category || '',
      experience: apiJob.experience || '',
      salary: apiJob.salary || '',
      description: apiJob.description,
      responsibilities:
        apiJob.responsibilities ||
        apiJob.description.split('\n').filter((line: string) => line.trim()),
      requirements: apiJob.requirements || [],
      benefits: apiJob.benefits || [],
      matchPercentage: apiJob.matchPercentage || 0,
      skillMatch: apiJob.skillMatch || [],
      postedDate:
        apiJob.postedDate || new Date(apiJob.createdAt).toLocaleDateString(),
      deadline: apiJob.deadline || '',
      companyInfo: apiJob.companyInfo || {
        logo: 'assets/logos/default.png',
        description: '',
        website: '',
        employees: '',
        industry: '',
        founded: '',
      },
      isSaved: apiJob.isSaved || false,
    };
  }

  getMockJobDetail(): JobDetail {
    // Fallback to mock data
    return {
      id: this.jobId,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'Software Development',
      experience: 'Senior Level',
      salary: '$120K - $150K',
      description: `We are looking for a skilled Senior Frontend Developer...`,
      responsibilities: [
        'Develop and implement user interfaces using modern frontend frameworks',
        // ... other responsibilities
      ],
      requirements: [
        '5+ years of experience as a Frontend Developer',
        // ... other requirements
      ],
      benefits: [
        'Competitive salary and equity package',
        // ... other benefits
      ],
      matchPercentage: 92,
      skillMatch: [
        { skill: 'JavaScript', level: 95 },
        // ... other skills
      ],
      postedDate: '2 days ago',
      deadline: 'April 30, 2025',
      companyInfo: {
        logo: 'assets/logos/techcorp.png',
        description: `TechCorp Inc. is a leading technology company...`,
        website: 'https://techcorp.example.com',
        employees: '500+',
        industry: 'Software Development',
        founded: '2010',
      },
      isSaved: false,
    };
  }

  loadSimilarJobs(): void {
    if (!this.job) return;

    this.jobService.getSimilarJobs(this.jobId).subscribe({
      next: (response) => {
        this.similarJobs = response.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          matchPercentage: job.matchPercentage || 0,
          // logo: job.logo || 'assets/logos/default.png',
        }));
      },
      error: (err) => {
        console.error('Error loading similar jobs:', err);
        // Fallback to mock data
        this.similarJobs = [
          {
            id: '2',
            title: 'Frontend Developer',
            company: 'WebTech Solutions',
            location: 'Remote',
            matchPercentage: 88,
            logo: 'assets/logos/webtech.png',
          },
          // ... other mock similar jobs
        ];
      },
    });
  }

  setActiveTab(tab: 'description' | 'company' | 'match'): void {
    this.activeTab = tab;
  }

  toggleSaved(): void {
    if (!this.job) return;

    const originalSaveState = this.job.isSaved;

    // Optimistically update UI
    this.job.isSaved = !this.job.isSaved;

    if (this.job.isSaved) {
      this.jobService.saveJob(this.jobId).subscribe({
        error: (err) => {
          console.error('Error saving job:', err);
          // Revert on error
          if (this.job) this.job.isSaved = originalSaveState;
        },
      });
    } else {
      this.jobService.unsaveJob(this.jobId).subscribe({
        error: (err) => {
          console.error('Error unsaving job:', err);
          // Revert on error
          if (this.job) this.job.isSaved = originalSaveState;
        },
      });
    }
  }

  startApplication(): void {
    this.showApplication = true;
    setTimeout(() => {
      const applicationForm = document.getElementById('applicationForm');
      if (applicationForm) {
        applicationForm.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  submitApplication(): void {
    if (!this.job) return;

    this.isLoading = true;

    const applicationData = {
      jobId: this.jobId,
      coverLetter: this.coverLetter,
    };

    this.applicationService.applyForJob(this.jobId, applicationData).subscribe({
      next: (response) => {
        this.applicationSubmitted = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error submitting application:', err);
        this.error =
          err.error?.message ||
          'Failed to submit application. Please try again.';
        this.isLoading = false;

        // For demo purposes, still show as submitted
        this.applicationSubmitted = true;
      },
    });
  }
}
