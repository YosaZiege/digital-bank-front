import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest } from '../models/auth.model';

const API_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isLoggedIn = signal(false);
  username = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn.set(!!localStorage.getItem('access_token'));
      this.username.set(localStorage.getItem('username'));
    }
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('username', response.username);
        }
        this.isLoggedIn.set(true);
        this.username.set(response.username);
      }),
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
    }
    this.isLoggedIn.set(false);
    this.username.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}
