import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const moduloGuard = (codigo: string): CanActivateFn =>
  () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    if (auth.tienePermiso(codigo)) return true;
    return router.createUrlTree(['/notfound']);
  };