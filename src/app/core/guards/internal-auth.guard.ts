import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class InternalAuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean | UrlTree {
    const isInternal = this.auth.userRole() === 'Internal';
    if (isInternal) return true;
    return this.router.parseUrl('/login');
  }
}
