import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  if (token) {
    return next(
      req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      }),
    );
  }
  return next(req);
};
