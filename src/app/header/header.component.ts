import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userRole: 'job-seeker' | 'recruiter' | 'admin' | null = null;
  isMenuOpen = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedAuth = localStorage.getItem('auth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          this.isLoggedIn = true;
          this.userRole = authData.role;
        } catch (error) {
          console.error('Invalid auth data in localStorage', error);
          // Clear the corrupted data
          localStorage.removeItem('auth');
          this.isLoggedIn = false;
          this.userRole = null;
        }
      }
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth');
      this.isLoggedIn = false;
      this.userRole = null;
      window.location.href = '/';
    }
  }
}
