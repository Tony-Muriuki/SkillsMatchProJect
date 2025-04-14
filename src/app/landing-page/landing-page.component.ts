import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

interface BenefitCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  featureCards: FeatureCard[] = [];
  benefitCards: BenefitCard[] = [];

  ngOnInit(): void {
    this.initializeFeatureCards();
    this.initializeBenefitCards();
  }

  private initializeFeatureCards(): void {
    this.featureCards = [
      {
        icon: 'user-profile',
        title: 'Create Your Profile',
        description:
          'Build a comprehensive profile highlighting your skills and experience to get noticed by recruiters.',
      },
      {
        icon: 'ai-matching',
        title: 'AI Skills Matching',
        description:
          'Our advanced algorithms match your skills with job requirements for better opportunities.',
      },
      {
        icon: 'application',
        title: 'Apply to Matched Jobs',
        description:
          'Apply with one click to opportunities where your skills and potential are already recognized.',
      },
      {
        icon: 'interview',
        title: 'Get Interviews',
        description:
          'Schedule interviews through the platform and receive notifications for every step.',
      },
    ];
  }

  private initializeBenefitCards(): void {
    this.benefitCards = [
      {
        icon: 'visibility',
        title: 'Increase Visibility',
        description:
          'Get noticed by top companies looking for your specific skill set, even without traditional credentials.',
      },
      {
        icon: 'career-path',
        title: 'Career Path Guidance',
        description:
          'Receive AI-powered suggestions for skills to develop and potential career paths based on your profile.',
      },
      {
        icon: 'application-tracking',
        title: 'Application Tracking',
        description:
          'Monitor all your applications in one place and stay updated on their progress.',
      },
    ];
  }
}
