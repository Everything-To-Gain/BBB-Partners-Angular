import { Component, input, output, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [HlmButton, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | null | undefined>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private themeService = inject(ThemeService);

  // Dropdown state
  isDropdownOpen = signal(false);
  isUserMenuOpen = signal(false);

  // Theme state
  get isDark() {
    return this.themeService.isDark();
  }

  // Auth getters
  get userName() {
    return this.authService.userName();
  }
  get userEmail() {
    return this.authService.userEmail();
  }
  get userRole() {
    return this.authService.userRole();
  }
  get isAdmin(): boolean {
    return this.authService.isAdmin() === 'true';
  }

  get isNotInternal(): boolean {
    const role = this.userRole;
    return role !== null && role !== 'Internal';
  }

  get contractorFormUrl(): string {
    const role = this.userRole;

    // Map role to partnership source and generate form URL
    if (role === 'ContractorsOfColorado') {
      return '/business-registration/contractors-of-colorado';
    } else if (role === 'RealEstateDealMakers') {
      return '/business-registration/real-estate-deal-makers';
    }

    // Fallback to contractor-form route if role doesn't match
    return '/dashboard/contractor-form';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown(): void {
    // Close user menu if open
    if (this.isUserMenuOpen()) {
      this.isUserMenuOpen.set(false);
    }
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  toggleUserMenu(): void {
    // Close dropdown if open
    if (this.isDropdownOpen()) {
      this.isDropdownOpen.set(false);
    }
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown-container');
    const userMenu = target.closest('.user-menu-container');
    const isBackdrop = target.classList.contains('fixed') && target.classList.contains('inset-0');

    // Don't close if clicking on backdrop (backdrop handles its own click)
    if (isBackdrop) {
      return;
    }

    if (!dropdown && this.isDropdownOpen()) {
      this.closeDropdown();
    }

    if (!userMenu && this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
