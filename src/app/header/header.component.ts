import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  ngOnInit(): void {
    // This would typically come from an auth service
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    // Mock implementation - replace with actual auth service
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      this.isLoggedIn = true;
      this.userRole = authData.role;
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    // Mock implementation - replace with actual auth service
    localStorage.removeItem('auth');
    this.isLoggedIn = false;
    this.userRole = null;
    // Navigate to home
    window.location.href = '/';
  }
}
