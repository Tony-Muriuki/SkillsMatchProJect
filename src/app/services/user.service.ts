// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface UserProfile {
  title: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  about?: string;
  profileImageUrl?: string;
  // Add other profile properties
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.env.apiUrl}/users/profile`);
  }

  updateProfile(profileData: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.env.apiUrl}/users/profile`,
      profileData
    );
  }

  uploadProfileImage(formData: FormData): Observable<{ imageUrl: string }> {
    return this.http.post<{ imageUrl: string }>(
      `${this.env.apiUrl}/users/profile/image`,
      formData
    );
  }

  getPublicProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.env.apiUrl}/users/${userId}`);
  }
}
