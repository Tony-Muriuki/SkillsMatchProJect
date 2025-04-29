import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  userRole: 'job-seeker' | 'recruiter' | 'admin' = 'job-seeker';
  signinForm!: FormGroup;
  isPasswordVisible = false;
  isLoading = false;
  error: string = '';

  // Computed property to maintain backward compatibility with template
  get isAdminMode(): boolean {
    return this.userRole === 'admin';
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the role from query params if available
    this.route.queryParams.subscribe((params) => {
      const roleParam = params['role'] as 'job-seeker' | 'recruiter' | 'admin';
      if (roleParam) {
        this.userRole = roleParam;
      }

      this.initializeForm();
    });
  }

  initializeForm(): void {
    if (this.userRole === 'admin') {
      this.signinForm = this.fb.group({
        adminCode: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
      });
    } else {
      this.signinForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        rememberMe: [false],
      });
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit(): void {
    if (this.signinForm.valid) {
      this.isLoading = true;
      this.error = '';

      const credentials = {
        ...this.signinForm.value,
        role: this.userRole,
      };

      if (this.userRole === 'admin') {
        this.authService.adminLogin(credentials).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.router.navigate(['/dashboard/admin']);
          },
          error: (err) => {
            this.isLoading = false;
            this.error =
              err.error?.message || 'Failed to sign in. Please try again.';
          },
        });
      } else {
        this.authService.login(credentials).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.router.navigate([`/dashboard/${this.userRole}`]);
          },
          error: (err) => {
            this.isLoading = false;
            this.error =
              err.error?.message || 'Failed to sign in. Please try again.';
          },
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.signinForm.markAllAsTouched();
    }
  }

  // Updated method to select a specific role
  selectRole(role: 'job-seeker' | 'recruiter' | 'admin'): void {
    this.userRole = role;
    this.initializeForm();
  }

  toggleAdminMode(): void {
    this.userRole = this.isAdminMode ? 'job-seeker' : 'admin';
    this.initializeForm();
  }
}
