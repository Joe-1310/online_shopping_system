import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  let authReq = req;

  if (!(req.body instanceof FormData)) {
    authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  } else {
    authReq = req.clone({
      withCredentials: true,
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        return authService.refresh().pipe(
          switchMap(() => next(authReq)),
          catchError(innerErr => {
            authService.logout();
            return throwError(() => innerErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
