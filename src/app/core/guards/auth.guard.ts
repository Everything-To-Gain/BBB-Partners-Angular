import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    // Check if user is authenticated
    if (this.auth.isAuthenticated()) {
      return true;
    }

    // If not authenticated, redirect to login
    return this.router.parseUrl('/login');
  }
}
