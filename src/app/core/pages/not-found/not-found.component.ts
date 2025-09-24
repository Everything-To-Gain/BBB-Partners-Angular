import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding, lucideArrowLeft } from '@ng-icons/lucide';

@Component({
  selector: 'app-not-found',
  imports: [HlmButton, NgIcon],
  providers: [
    provideIcons({
      lucideBuilding,
      lucideArrowLeft,
    }),
  ],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full text-center">
        <!-- 404 Number -->
        <div class="text-6xl md:text-8xl font-bold text-primary mb-4">404</div>

        <!-- Title -->
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>

        <!-- Description -->
        <p class="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button hlmBtn variant="default" size="lg" (click)="goHome()" class="w-full">
            <ng-icon name="lucideBuilding" class="w-4 h-4 mr-2" />
            Go to Home
          </button>

          <button hlmBtn variant="outline" size="lg" (click)="goBack()" class="w-full">
            <ng-icon name="lucideArrowLeft" class="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>

        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500">BBB Partners Portal</p>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  private router = inject(Router);

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
