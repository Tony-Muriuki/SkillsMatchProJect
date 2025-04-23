// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  token?: string;
  user?: any;
  // add other properties your API returns
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  register(userData: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.env.apiUrl}/auth/register`, userData)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.env.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  adminLogin(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.env.apiUrl}/auth/login/admin`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          if (response && response.token) {
            localStorage.setItem('token', response.token);
          }
        })
      );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.env.apiUrl}/auth/me`);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
