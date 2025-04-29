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
  isLoading = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the role from route params
    this.route.params.subscribe((params) => {
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
      this.isLoading = true;
      this.error = '';

      // Check if passwords match
      if (
        this.signupForm.value.password !== this.signupForm.value.confirmPassword
      ) {
        this.error = 'Passwords do not match';
        this.isLoading = false;
        return;
      }

      const userData = {
        ...this.signupForm.value,
        role: this.userRole,
      };

      // Remove confirmPassword before sending to API
      delete userData.confirmPassword;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate([`/dashboard/${this.userRole}`]);
        },
        error: (err) => {
          this.isLoading = false;
          this.error =
            err.error?.message || 'Registration failed. Please try again.';
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.signupForm.markAllAsTouched();
    }
  }
}
