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
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  userRole: 'job-seeker' | 'recruiter' | null = null;
  signupForm!: FormGroup;
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    // Get the role from query params
    this.route.queryParams.subscribe((params) => {
      this.userRole = params['role'] as 'job-seeker' | 'recruiter';
      this.initializeForm();
    });
  }

  initializeForm(): void {
    // Common fields for both roles
    const commonFields = {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    };

    // Additional fields for recruiter
    if (this.userRole === 'recruiter') {
      this.signupForm = this.fb.group({
        ...commonFields,
        companyName: ['', [Validators.required]],
        jobTitle: ['', [Validators.required]],
      });
    } else {
      this.signupForm = this.fb.group(commonFields);
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);

      // Mock signup - would typically call an auth service
      const userData = {
        ...this.signupForm.value,
        role: this.userRole,
      };

      localStorage.setItem('auth', JSON.stringify(userData));

      // Navigate to appropriate dashboard
      window.location.href = `/dashboard/${this.userRole}`;
    } else {
      // Mark all fields as touched to show validation errors
      this.signupForm.markAllAsTouched();
    }
  }
}
