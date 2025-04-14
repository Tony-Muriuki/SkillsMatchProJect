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
  userRole: 'job-seeker' | 'recruiter' | 'admin' | null = null;
  signinForm!: FormGroup;
  isPasswordVisible = false;
  isAdminMode = false;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Get the role from query params if available
    this.route.queryParams.subscribe((params) => {
      this.userRole = params['role'] as 'job-seeker' | 'recruiter' | 'admin';

      if (this.userRole === 'admin') {
        this.isAdminMode = true;
      }

      this.initializeForm();
    });
  }

  initializeForm(): void {
    if (this.isAdminMode) {
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
        role: this.isAdminMode ? 'admin' : this.userRole || 'job-seeker',
      };

      localStorage.setItem('auth', JSON.stringify(userData));

      // Navigate to appropriate dashboard
      const roleForRedirect = this.isAdminMode
        ? 'admin'
        : this.userRole || 'job-seeker';
      window.location.href = `/dashboard/${roleForRedirect}`;
    } else {
      // Mark all fields as touched to show validation errors
      this.signinForm.markAllAsTouched();
    }
  }

  toggleAdminMode(): void {
    this.isAdminMode = !this.isAdminMode;
    this.initializeForm();
  }
}
