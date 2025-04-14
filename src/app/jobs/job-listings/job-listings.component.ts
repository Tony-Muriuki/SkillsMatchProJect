import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  category: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  matchPercentage: number;
  postedDate: string;
  logo: string;
  isSaved: boolean;
}

interface Filter {
  search: string;
  location: string;
  jobType: string[];
  category: string[];
  experience: string[];
  salary: string[];
}

@Component({
  selector: 'app-job-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-listings.component.html',
  styleUrl: './job-listings.component.scss',
})
export class JobListingsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  isLoading = true;

  // Filter options
  jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  categories = [
    'Software Development',
    'Design',
    'Marketing',
    'Sales',
    'Customer Service',
    'Finance',
    'HR',
  ];
  experienceLevels = [
    'Entry Level',
    'Mid Level',
    'Senior Level',
    'Director',
    'Executive',
  ];
  salaryRanges = [
    '$0-$50k',
    '$50k-$80k',
    '$80k-$100k',
    '$100k-$150k',
    '$150k+',
  ];

  // Current filters
  filters: Filter = {
    search: '',
    location: '',
    jobType: [],
    category: [],
    experience: [],
    salary: [],
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.loadJobs();
  }

  private loadJobs(): void {
    // Simulate API call
    setTimeout(() => {
      this.jobs = this.getMockJobs();
      this.filteredJobs = [...this.jobs];
      this.isLoading = false;
      this.calculateTotalPages();
    }, 1000);
  }

  private getMockJobs(): Job[] {
    // Mock job data
    return [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        category: 'Software Development',
        experience: 'Senior Level',
        salary: '$120K - $150K',
        description:
          'We are looking for a skilled Frontend Developer to join our team...',
        requirements: [
          '5+ years of experience',
          'Expert in JavaScript',
          'React/Angular experience',
        ],
        matchPercentage: 92,
        postedDate: '2 days ago',
        logo: 'assets/logos/techcorp.png',
        isSaved: false,
      },
      {
        id: '2',
        title: 'UX Designer',
        company: 'DesignMasters',
        location: 'Remote',
        type: 'Full-time',
        category: 'Design',
        experience: 'Mid Level',
        salary: '$90K - $110K',
        description:
          'Join our design team to create amazing user experiences...',
        requirements: [
          '3+ years of UX design',
          'Portfolio of work',
          'User research experience',
        ],
        matchPercentage: 85,
        postedDate: '1 week ago',
        logo: 'assets/logos/designmasters.png',
        isSaved: true,
      },
      {
        id: '3',
        title: 'Backend Developer',
        company: 'ServerStack',
        location: 'New York, NY',
        type: 'Full-time',
        category: 'Software Development',
        experience: 'Mid Level',
        salary: '$100K - $130K',
        description:
          'Looking for a backend developer to build scalable systems...',
        requirements: [
          '3+ years of experience',
          'Node.js/Python',
          'Database knowledge',
        ],
        matchPercentage: 78,
        postedDate: '3 days ago',
        logo: 'assets/logos/serverstack.png',
        isSaved: false,
      },
      {
        id: '4',
        title: 'Marketing Specialist',
        company: 'Growth Hackers',
        location: 'Chicago, IL',
        type: 'Full-time',
        category: 'Marketing',
        experience: 'Mid Level',
        salary: '$70K - $90K',
        description: 'Join our marketing team to drive growth strategies...',
        requirements: [
          '2+ years in digital marketing',
          'SEO knowledge',
          'Content creation skills',
        ],
        matchPercentage: 65,
        postedDate: '1 week ago',
        logo: 'assets/logos/growthhackers.png',
        isSaved: false,
      },
      {
        id: '5',
        title: 'Sales Representative',
        company: 'SalesForce Pro',
        location: 'Miami, FL',
        type: 'Full-time',
        category: 'Sales',
        experience: 'Entry Level',
        salary: '$60K - $80K',
        description:
          'Looking for ambitious sales representatives to join our team...',
        requirements: [
          '1+ year of sales experience',
          'CRM knowledge',
          'Communication skills',
        ],
        matchPercentage: 70,
        postedDate: '5 days ago',
        logo: 'assets/logos/salesforcepro.png',
        isSaved: false,
      },
    ];
  }

  toggleSaved(job: Job): void {
    job.isSaved = !job.isSaved;
    // In a real app, would call a service to update the saved status
  }

  applyFilters(): void {
    this.isLoading = true;

    // Simulate API call with filters
    setTimeout(() => {
      this.filteredJobs = this.jobs.filter((job) => {
        // Search text filter
        if (
          this.filters.search &&
          !job.title
            .toLowerCase()
            .includes(this.filters.search.toLowerCase()) &&
          !job.company.toLowerCase().includes(this.filters.search.toLowerCase())
        ) {
          return false;
        }

        // Location filter
        if (
          this.filters.location &&
          !job.location
            .toLowerCase()
            .includes(this.filters.location.toLowerCase())
        ) {
          return false;
        }

        // Job type filter
        if (
          this.filters.jobType.length > 0 &&
          !this.filters.jobType.includes(job.type)
        ) {
          return false;
        }

        // Category filter
        if (
          this.filters.category.length > 0 &&
          !this.filters.category.includes(job.category)
        ) {
          return false;
        }

        // Experience filter
        if (
          this.filters.experience.length > 0 &&
          !this.filters.experience.includes(job.experience)
        ) {
          return false;
        }

        // Salary filter
        if (this.filters.salary.length > 0) {
          // This is a simplified version - would need more complex logic for salary ranges
          const matchesSalary = this.filters.salary.some((range) => {
            return job.salary.includes(range.replace('k', 'K'));
          });

          if (!matchesSalary) {
            return false;
          }
        }

        return true;
      });

      this.currentPage = 1;
      this.calculateTotalPages();
      this.isLoading = false;
    }, 500);
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      location: '',
      jobType: [],
      category: [],
      experience: [],
      salary: [],
    };

    this.applyFilters();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredJobs.length / this.itemsPerPage);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      // Scroll to top of results
      window.scrollTo(0, 0);
    }
  }

  getCurrentPageItems(): Job[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredJobs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  toggleFilter(category: string, value: string): void {
    const filterCategory = this.filters[category as keyof Filter] as string[];
    const index = filterCategory.indexOf(value);

    if (index === -1) {
      filterCategory.push(value);
    } else {
      filterCategory.splice(index, 1);
    }

    this.applyFilters();
  }

  isFilterSelected(category: string, value: string): boolean {
    return (this.filters[category as keyof Filter] as string[]).includes(value);
  }
}
