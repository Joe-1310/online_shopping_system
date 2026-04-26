import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/users`;
  private readonly authApiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.authApiUrl}/me`, { withCredentials: true });
  }

  
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.authApiUrl}/me`, userData, { withCredentials: true });
  }


  getCurrentUser(): Observable<User> {
    return this.getProfile();
  }

  getUsers(
    page: number = 0,
    size: number = 20,
    name?: string,
    email?: string,
    role?: string,
    id?: number
  ): Observable<PaginatedResponse<User>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (name) {
      params = params.set('name', name);
    }
    if (email) {
      params = params.set('email', email);
    }
    if (role) {
      params = params.set('role', role);
    }
    if (id) {
      params = params.set('id', id.toString());
    }

    return this.http.get<PaginatedResponse<User>>(this.apiUrl, { params });
  }


  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }


  updateUserRole(id: number, newRole: string): Observable<any> {
    console.log(`Making API call to: ${this.apiUrl}/${id}/role`);
    console.log('Payload:', { role: newRole });

    return this.http.put(
      `${this.apiUrl}/${id}/role`,
      { role: newRole },
      {
        responseType: 'text' as 'json',
      }
    );
  }

  updateUserRoles(id: number, roles: string[]): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/roles`, { roles });
  }

  getUserOrderCount(userId: number): Observable<number> {
    const url = `${this.apiUrl}/${userId}/order-count`;
    console.log('Requesting user order count from:', url);
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((response) => {
        console.log('Raw order count response:', response);
        const count = parseInt(response, 10);
        console.log('Parsed order count:', count);
        return isNaN(count) ? 0 : count;
      })
    );
  }

  getUserLastOrderDate(userId: number): Observable<string | null> {
    const url = `${this.apiUrl}/${userId}/last-order-date`;
    console.log('Requesting user last order date from:', url);
    return this.http.get(url, { responseType: 'text' }).pipe(
      map((response) => {
        console.log('Raw last order date response:', response);
        return response || null;
      })
    );
  }
}
