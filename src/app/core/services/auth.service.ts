import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Read initial token from sessionStorage
  private readonly initialToken = sessionStorage.getItem('token');
  
  readonly token = signal<string | null>(this.initialToken);
  readonly currentUser = signal<User | null>(null); // We would normally decode JWT here or fetch user profile on app load if token exists

  constructor() {
    // If we have a token on startup, we could optionally parse the JWT to restore currentUser state
    // For this mock, if we have a token, we assume logged in.
  }

  login(credentials: { username: string; password: string }): Observable<{ token: string; userId: string; username: string }> {
    // Using environment.apiUrl if available, otherwise fallback to standard '/api'
    const apiUrl = environment.apiUrl || '/api';
    return this.http.post<{ token: string; userId: string; username: string }>(`${apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        // Store JWT in sessionStorage
        sessionStorage.setItem('token', response.token);
        
        // Update signals
        this.token.set(response.token);
        this.currentUser.set({
          userId: response.userId,
          username: response.username,
          token: response.token
        });
        
        // Navigate to dashboard on success
        this.router.navigate(['/dashboard']);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  signup(credentials: { username: string; password: string }): Observable<{ token: string; userId: string; username: string }> {
    const apiUrl = environment.apiUrl || '/api';
    return this.http.post<{ token: string; userId: string; username: string }>(`${apiUrl}/auth/signup`, credentials).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);
        this.token.set(response.token);
        this.currentUser.set({ userId: response.userId, username: response.username, token: response.token });
        this.router.navigate(['/dashboard']);
      }),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    // Clear storage and signals
    sessionStorage.removeItem('token');
    this.token.set(null);
    this.currentUser.set(null);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }
}
