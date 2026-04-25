import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastCtrl = inject(ToastController);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        // 401 while authenticated → token is no longer valid.
        if (err.status === 401 && auth.isLoggedIn()) auth.logout();

        // Login has its own inline error UI — don't double-surface.
        const isLoginRequest = req.url.includes('/auth/login');
        if (!isLoginRequest) {
          void toastCtrl
            .create({
              message: messageFor(err),
              duration: 2500,
              position: 'top',
              color: 'danger',
            })
            .then((t) => t.present());
        }
      }
      return throwError(() => err);
    })
  );
};

function messageFor(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Network error. Check your connection.';
  const apiMessage = (err.error as { message?: string } | null)?.message;
  return apiMessage ?? `Request failed (${err.status}).`;
}
