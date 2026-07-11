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
  readonly currentUser = signal<User | null>(this.restoreUser());

  private restoreUser(): User | null {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  }

  login(credentials: { username: string; password: string }): Observable<{ token: string; userId: string; username: string }> {
    // Using environment.apiUrl if available, otherwise fallback to standard '/api'
    const apiUrl = environment.apiUrl || '/api';
    return this.http.post<{ token: string; userId: string; username: string }>(`${apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);
        const user = { userId: response.userId, username: response.username, token: response.token };
        sessionStorage.setItem('user', JSON.stringify(user));
        this.token.set(response.token);
        this.currentUser.set(user);
        this.router.navigate(['/dashboard']);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  signup(credentials: { username: string; email: string; role: string; password: string }): Observable<{ token: string; userId: string; username: string }> {
    const apiUrl = environment.apiUrl || '/api';
    return this.http.post<{ token: string; userId: string; username: string }>(`${apiUrl}/auth/signup`, credentials).pipe(
      tap(response => {
        sessionStorage.setItem('token', response.token);
        const user = { userId: response.userId, username: response.username, token: response.token };
        sessionStorage.setItem('user', JSON.stringify(user));
        this.token.set(response.token);
        this.currentUser.set(user);
        this.router.navigate(['/dashboard']);
      }),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  resetCredentials(payload: { email: string; newUsername?: string; newPassword?: string }): Observable<any> {
    const apiUrl = environment.apiUrl || '/api';
    return this.http.put(`${apiUrl}/auth/reset-credentials`, payload);
  }

  getProfile(): Observable<User> {
    const apiUrl = environment.apiUrl || '/api';
    return this.http.get<User>(`${apiUrl}/auth/profile`).pipe(
      tap(user => {
        // Update the current user signal and session storage with fetched profile
        const current = this.currentUser();
        const updatedUser = { ...current, ...user };
        this.currentUser.set(updatedUser as User);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      })
    );
  }
}
