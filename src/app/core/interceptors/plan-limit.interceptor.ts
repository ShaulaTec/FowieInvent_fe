// src/app/core/interceptors/plan-limit.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const planLimitInterceptor: HttpInterceptorFn = (req, next) => {
  const message = inject(MessageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 400) {
        const detail: string =
          err.error?.detail ??
          err.error?.non_field_errors?.[0] ??
          '';

        if (/tu plan solo permite/i.test(detail)) {
          message.add({
            severity: 'warn',
            summary:  'Límite de plan alcanzado',
            detail,
            life:     6000,
          });
          return throwError(() => ({ planLimit: true, message: detail }));
        }
      }
      return throwError(() => err);
    })
  );
};