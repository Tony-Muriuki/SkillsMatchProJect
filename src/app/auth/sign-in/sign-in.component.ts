import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  toggleAdminMode() {
    throw new Error('Method not implemented.');
  }
  userRole: 'job-seeker' | 'recruiter' | 'admin' = 'job-seeker';
  signinForm!: FormGroup;
  isPasswordVisible = false;

  // Computed property to maintain backward compatibility with template
  get isAdminMode(): boolean {
    return this.userRole === 'admin';
  }

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

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
      console.log('Form submitted:', this.signinForm.value);

      // Mock signin - would typically call an auth service
      const userData = {
        ...this.signinForm.value,
        role: this.userRole,
      };

      localStorage.setItem('auth', JSON.stringify(userData));

      // Navigate to appropriate dashboard
      window.location.href = `/dashboard/${this.userRole}`;
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
}
