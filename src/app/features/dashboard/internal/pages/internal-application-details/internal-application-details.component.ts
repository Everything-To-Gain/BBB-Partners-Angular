import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InternalService } from '../../services/internal.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ApplicationDetails } from '../../models/internal-application.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import { DashboardHeaderComponent } from '../../../../../shared/components/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-internal-application-details',
  templateUrl: './internal-application-details.component.html',
  imports: [HlmCardImports, HlmButton, DashboardHeaderComponent],
})
export class InternalApplicationDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private internalService = inject(InternalService);
  private authService = inject(AuthService);

  applicationDetails = signal<ApplicationDetails | null>(null);
  isLoading = signal(false);
  applicationId = signal<string | null>(null);
  tobName = signal<string | null>(null);
  isLoadingTOB = signal(false);

  // Collapsible sections state
  expandedSections = signal<Set<string>>(new Set());
  allExpanded = signal(false);

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

          // Fetch TOB name if businessType is available
          if (response.data.businessType) {
            this.loadTOBName(response.data.businessType);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading application details:', error);
        this.isLoading.set(false);
      },
    });
  }

  private loadTOBName(businessType: string): void {
    this.isLoadingTOB.set(true);
    this.internalService.getTOBName(businessType).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tobName.set(response.data);
        }
        this.isLoadingTOB.set(false);
      },
      error: (error) => {
        console.error('Error loading TOB name:', error);
        // Set a fallback value if the request fails
        this.tobName.set('Type of Business not available');
        this.isLoadingTOB.set(false);
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

  // Format date for display
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
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

  // Collapsible section methods
  toggleSection(sectionId: string): void {
    const current = this.expandedSections();
    const newSet = new Set(current);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    this.expandedSections.set(newSet);
  }

  isSectionExpanded(sectionId: string): boolean {
    return this.expandedSections().has(sectionId);
  }

  toggleAllSections(): void {
    const allExpanded = this.allExpanded();
    this.allExpanded.set(!allExpanded);

    if (allExpanded) {
      // Collapse all
      this.expandedSections.set(new Set());
    } else {
      // Expand all
      const allSections = [
        'business-info',
        'contact-info',
        'business-operations',
        'financial-info',
        'application-details',
        'licenses',
        'social-media',
        'additional-info',
        'submission-info',
      ];
      this.expandedSections.set(new Set(allSections));
    }
  }
}
