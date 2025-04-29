import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userRole: 'job-seeker' | 'recruiter' | 'admin' | null = null;
  isMenuOpen = false;
  private authSubscription: Subscription | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();

    // Subscribe to auth changes
    if (isPlatformBrowser(this.platformId)) {
      this.authSubscription = this.authService.currentUser$.subscribe(
        (user) => {
          this.isLoggedIn = !!user;
          if (user) {
            this.userRole = user.role || null;
          } else {
            this.userRole = null;
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = this.authService.isLoggedIn();
      const user = this.authService.getStoredUser();
      if (user) {
        this.userRole = user.role || null;
      }
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logout();
      window.location.href = '/';
    }
  }
}
