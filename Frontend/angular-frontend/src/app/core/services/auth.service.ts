import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable, BehaviorSubject } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  public googleClientId = environment.googleClientId;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(() => {
          // After successful login, get user data and redirect
          this.getCurrentUser().subscribe();
        })
      );
  }

  signup(
    username: string,
    email: string,
    role: string,
    password: string,
    confirmPassword: string
  ): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/register`,
        {
          username,
          email,
          role,
          password,
          confirmPassword,
        },
        { withCredentials: true }
      )
      .pipe(
        tap(() => {
          this.router.navigate(['/public/login']);
        })
      );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
        this.redirectUserBasedOnRole(user);
      })
    );
  }

  getCurrentUserSilent(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
      })
    );
  }

  private redirectUserBasedOnRole(user: User): void {
    const roleName = this.extractRoleName(user);

    if (!user || !roleName) {
      // If no valid role, redirect to public page
      this.router.navigate(['/public']);
      return;
    }

    // clean navigation based on role
    if (roleName.includes('ADMIN')) {
      this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
    } else if (roleName === 'CUSTOMER') {
      this.router.navigate(['/shop/products'], { replaceUrl: true });
    } else {
      this.router.navigate(['/public'], { replaceUrl: true });
    }
  }

  refresh(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh`, {}, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/public/login']);
      })
    );
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    const roleName = this.extractRoleName(user);
    return roleName ? roleName.toLowerCase().includes('admin') : false;
  }

  isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    const roleName = this.extractRoleName(user);
    return roleName === 'CUSTOMER';
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  loginWithGoogle(idToken: string): void {
    this.http
      .post(`${environment.apiUrl}/oauth/google`, { idToken }, { withCredentials: true })
      .subscribe({
        next: () => this.getCurrentUser().subscribe(),
        error: (err) => console.error('Google login failed', err),
      });
  }

  loginWithGithub(): void {
    window.location.href = `${environment.apiUrl}/oauth/github`;
  }

  // Helper method to extract role name from either Role object or string
  private extractRoleName(user: User): string | null {
    if (!user || !user.role) {
      return null;
    }

    if (typeof user.role === 'string') {
      return user.role;
    }

    if (typeof user.role === 'object' && user.role.roleName) {
      return user.role.roleName;
    }

    return null;
  }
}
