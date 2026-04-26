import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const authService = inject(AuthService);

  const expectedRole = route.data['role'];

  return http.get(`${environment.apiUrl}/auth/me`, { withCredentials: true }).pipe(
    map((res: any) => {
      // Extract role name from either Role object or string
      let roleName: string | null = null;
      if (typeof res.role === 'string') {
        roleName = res.role;
      } else if (res.role && res.role.roleName) {
        roleName = res.role.roleName;
      }

      if (roleName && roleName.includes(expectedRole)) {
        authService.updateCurrentUser(res);
        return true;
      } else {
        router.navigate(['/public/unauthorized']);
        return false;
      }
    }),
    catchError((err) => {
      console.error('Auth guard error:', err);
      authService.clearCurrentUser();
      router.navigate(['/public/login']);
      return of(false);
    })
  );
};
