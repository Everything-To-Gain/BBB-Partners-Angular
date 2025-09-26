import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InternalService } from '../../services/internal.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ApplicationDetails } from '../../models/internal-application.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-internal-application-details',
  templateUrl: './internal-application-details.component.html',
  imports: [HlmCardImports, HlmButton],
})
export class InternalApplicationDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private internalService = inject(InternalService);
  private authService = inject(AuthService);

  applicationDetails = signal<ApplicationDetails | null>(null);
  isLoading = signal(false);
  applicationId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.applicationId.set(id);
        this.loadApplicationDetails(id);
      }
    });
  }

  private loadApplicationDetails(id: string): void {
    this.isLoading.set(true);
    this.internalService.getApplicationDetails(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.applicationDetails.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading application details:', error);
        this.isLoading.set(false);
      },
    });
  }

  formatStatusName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/internal/overview']);
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
