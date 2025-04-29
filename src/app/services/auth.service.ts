import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface AuthResponse {
  token?: string;
  user?: any;
  // add other properties your API returns
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private env: EnvironmentService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    // Only try to load user data if we're in a browser environment
    if (this.isBrowser) {
      this.loadCurrentUser();
    }
  }

  private loadCurrentUser(): void {
    if (this.isLoggedIn()) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
        },
        error: () => {
          // If there's an error (like expired token), clear the token
          if (this.isBrowser) {
            localStorage.removeItem('token');
            localStorage.removeItem('auth');
          }
        },
      });
    }
  }

  private storeUserData(user: any): void {
    if (this.isBrowser && user) {
      // Store the user data including role
      this.currentUserSubject.next(user);

      // If you still need the 'auth' localStorage item for legacy reasons
      try {
        localStorage.setItem(
          'auth',
          JSON.stringify({
            role: user.role || 'job-seeker', // Default to job-seeker if role is missing
          })
        );
      } catch (error) {
        console.error('Error storing auth data', error);
      }
    }
  }

  private mapUserResponse(user: any): any {
    // If your role is in a different property, map it here
    if (user && user.userType && !user.role) {
      user.role = user.userType;
    }
    return user;
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.env.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token && this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.user) {
              this.storeUserData(response.user);
            } else {
              // If no user object in response, fetch current user
              this.getCurrentUser().subscribe();
            }
          }
        })
      );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.env.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token && this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.user) {
              this.storeUserData(response.user);
            } else {
              // If no user object in response, fetch current user
              this.getCurrentUser().subscribe();
            }
          }
        })
      );
  }

  adminLogin(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.env.apiUrl}/auth/login/admin`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token && this.isBrowser) {
            localStorage.setItem('token', response.token);
            if (response.user) {
              this.storeUserData(response.user);
            } else {
              // If no user object in response, fetch current user
              this.getCurrentUser().subscribe();
            }
          }
        })
      );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.env.apiUrl}/auth/me`).pipe(
      tap((user) => {
        const mappedUser = this.mapUserResponse(user);
        this.storeUserData(mappedUser);
      }),
      catchError((error) => {
        console.error('Error fetching current user:', error);
        return of(null);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth'); // Remove both storage items
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('token') : false;
  }

  // Get current user synchronously
  getStoredUser(): any {
    return this.currentUserSubject.value;
  }

  // Safe method to get token that works in both browser and server
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }
}
