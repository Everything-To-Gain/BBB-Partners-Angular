import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export function redirectIfAuthenticated() {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is not authenticated, allow access to login page
  if (!authService.isAuthenticated()) {
    return true;
  }

  // If user is authenticated, redirect based on role
  const userRole = authService.userRole();
  const isAdmin = authService.isAdmin();
  const specialAccess = authService.specialAccess();

  if (isAdmin === 'true') {
    // Admin users go to admin dashboard
    router.navigate(['/dashboard/admin/overview']);
  } else if (userRole === 'Internal') {
    // Internal users go to internal dashboard
    router.navigate(['/dashboard/internal/overview']);
  } else if (userRole === 'Audit') {
    // Audit users go to audit dashboard
    router.navigate(['/dashboard/audit/overview']);
  } else if (userRole && userRole !== 'Internal') {
    // External users (any other role) go to external dashboard
    router.navigate(['/dashboard/overview']);
  } else {
    // Fallback - if no valid role, stay on login page
    console.warn('No valid role found for user');
  }

  return false; // Prevent access to login page since user is authenticated
}
