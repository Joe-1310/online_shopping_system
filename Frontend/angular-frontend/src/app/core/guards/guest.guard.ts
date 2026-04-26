import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const guestGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);

  return http.get(`${environment.apiUrl}/auth/me`, { withCredentials: true }).pipe(
    map((res: any) => {
      // Extract role name from either Role object or string
      let roleName: string | null = null;
      if (typeof res.role === 'string') {
        roleName = res.role;
      } else if (res.role && res.role.roleName) {
        roleName = res.role.roleName;
      }

      if (res && roleName) {
        if (roleName.toLowerCase().includes('admin')) {
          router.navigate(['/admin/dashboard']);
        } else if (roleName === 'CUSTOMER') {
          router.navigate(['/shop/dashboard']);
        } else {
          router.navigate(['/public/unauthorized']);
        }
        return false; // User is logged in, don't allow access to guest pages
      }

      return true; // User is not logged in, allow access to guest pages
    }),
    catchError((err) => {
      console.error('Guest guard error:', err);
      return of(true); // If there's an error, allow access (user is not logged in)
    })
  );
};
