import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if we have a token
  if (authService.token()) {
    return true;
  }

  // Not authenticated, redirect to login
  // Can pass returnUrl if we want to redirect back after login
  return router.createUrlTree(['/login']);
};
