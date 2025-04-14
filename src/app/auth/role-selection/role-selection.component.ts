import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Role {
  id: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.scss',
})
export class RoleSelectionComponent {
  roles: Role[] = [
    {
      id: 'job-seeker',
      title: 'Job Seeker',
      description:
        'Looking for new opportunities that match your skills and potential',
      icon: 'user',
    },
    {
      id: 'recruiter',
      title: 'Recruiter',
      description:
        'Hiring for your company and looking for the perfect candidates',
      icon: 'briefcase',
    },
    {
      id: 'admin',
      title: 'Admin',
      description:
        'Manage the SkillMatch AI platform (requires admin credentials)',
      icon: 'shield',
    },
  ];

  selectedRole: string | null = null;

  selectRole(roleId: string): void {
    this.selectedRole = roleId;
  }

  continueToSignup(): void {
    // Will be redirected to appropriate signup form in template
  }
}
