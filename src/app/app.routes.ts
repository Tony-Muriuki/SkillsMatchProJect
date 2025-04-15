import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { RoleSelectionComponent } from './auth/role-selection/role-selection.component';
import { JobSeekerDashboardComponent } from './dashboard/job-seeker-dashboard/job-seeker-dashboard.component';
import { RecruiterDashboardComponent } from './dashboard/recruiter-dashboard/recruiter-dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard/admin-dashboard.component';
import { ProfileManagementComponent } from './profile-management/profile-management.component';
import { JobListingsComponent } from './jobs/job-listings/job-listings.component';
import { JobDetailsComponent } from './jobs/job-details/job-details.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'auth',
    children: [
      { path: 'signin', component: SignInComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'role-selection', component: RoleSelectionComponent },
    ],
  },
  {
    path: 'dashboard',
    children: [
      { path: 'job-seeker', component: JobSeekerDashboardComponent },
      { path: 'recruiter', component: RecruiterDashboardComponent },
      { path: 'admin', component: AdminDashboardComponent },
    ],
  },
  { path: 'profile', component: ProfileManagementComponent },
  {
    path: 'jobs',
    children: [
      { path: '', component: JobListingsComponent },
      {
        path: ':id',
        component: JobDetailsComponent,
        // Explicitly set NOT to prerender
        data: {
          prerender: false,
          renderMode: 'client',
        },
      },
    ],
  },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', redirectTo: '' },
];
