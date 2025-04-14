import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private route: ActivatedRoute) {}

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
    // Simulate API call
    setTimeout(() => {
      this.job = this.getMockJobDetail();
      this.loadSimilarJobs();
      this.isLoading = false;
    }, 1000);
  }

  getMockJobDetail(): JobDetail {
    return {
      id: this.jobId,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      category: 'Software Development',
      experience: 'Senior Level',
      salary: '$120K - $150K',
      description: `
        We are looking for a skilled Senior Frontend Developer to join our team at TechCorp Inc. 
        You will be responsible for building and maintaining user interfaces for our web applications, 
        ensuring high-quality user experiences across all devices.
        
        As a Senior Frontend Developer, you will work closely with our design and backend teams to implement
        responsive and interactive features using modern web technologies. You should have a strong understanding
        of frontend frameworks, performance optimization, and accessibility standards.
      `,
      responsibilities: [
        'Develop and implement user interfaces using modern frontend frameworks (React, Angular)',
        'Collaborate with UX/UI designers to translate designs into high-quality code',
        'Ensure responsiveness and cross-browser compatibility',
        'Optimize applications for maximum speed and scalability',
        'Implement and maintain coding standards and best practices',
        'Mentor junior developers and participate in code reviews',
      ],
      requirements: [
        '5+ years of experience as a Frontend Developer',
        'Expert knowledge of JavaScript, HTML, and CSS',
        'Proficiency with React, Angular, or similar frontend frameworks',
        'Experience with responsive design and mobile-first approach',
        'Familiarity with RESTful APIs and integrating backend services',
        'Understanding of UI/UX design principles',
        'Experience with version control (Git) and agile methodologies',
      ],
      benefits: [
        'Competitive salary and equity package',
        'Health, dental, and vision insurance',
        'Flexible work hours and remote work options',
        'Professional development budget',
        'Company-sponsored events and team building activities',
        '401(k) matching program',
        'Generous vacation policy',
      ],
      matchPercentage: 92,
      skillMatch: [
        { skill: 'JavaScript', level: 95 },
        { skill: 'HTML/CSS', level: 90 },
        { skill: 'React', level: 85 },
        { skill: 'Angular', level: 80 },
        { skill: 'Responsive Design', level: 95 },
        { skill: 'Git', level: 90 },
      ],
      postedDate: '2 days ago',
      deadline: 'April 30, 2025',
      companyInfo: {
        logo: 'assets/logos/techcorp.png',
        description: `
          TechCorp Inc. is a leading technology company specializing in web and mobile applications. 
          Founded in 2010, we've grown to over 500 employees across offices in San Francisco, New York, and London.
          
          Our mission is to build user-friendly, innovative solutions that solve real-world problems. 
          We're passionate about technology and committed to creating a supportive, inclusive workplace where talented
          individuals can thrive and grow their careers.
        `,
        website: 'https://techcorp.example.com',
        employees: '500+',
        industry: 'Software Development',
        founded: '2010',
      },
      isSaved: false,
    };
  }

  loadSimilarJobs(): void {
    // Mock similar jobs
    this.similarJobs = [
      {
        id: '2',
        title: 'Frontend Developer',
        company: 'WebTech Solutions',
        location: 'Remote',
        matchPercentage: 88,
        logo: 'assets/logos/webtech.png',
      },
      {
        id: '3',
        title: 'UI Engineer',
        company: 'DesignMasters',
        location: 'New York, NY',
        matchPercentage: 85,
        logo: 'assets/logos/designmasters.png',
      },
      {
        id: '4',
        title: 'Senior JavaScript Developer',
        company: 'CodeCraft',
        location: 'San Francisco, CA',
        matchPercentage: 82,
        logo: 'assets/logos/codecraft.png',
      },
    ];
  }

  setActiveTab(tab: 'description' | 'company' | 'match'): void {
    this.activeTab = tab;
  }

  toggleSaved(): void {
    if (this.job) {
      this.job.isSaved = !this.job.isSaved;
      // In a real app, would call a service to update the saved status
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
    // Simulate form submission
    this.isLoading = true;
    setTimeout(() => {
      this.applicationSubmitted = true;
      this.isLoading = false;
    }, 1500);
  }
}
