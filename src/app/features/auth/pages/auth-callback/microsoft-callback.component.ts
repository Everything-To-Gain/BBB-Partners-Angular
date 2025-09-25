import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-microsoft-callback',
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex flex-col items-center justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-20 -right-20 w-40 h-40 sm:-top-40 sm:-right-40 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"
        ></div>
        <div
          class="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"
        ></div>
      </div>

      <div class="relative z-10 text-center max-w-md mx-auto">
        <!-- Loading Animation -->
        <div
          class="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse"
        >
          <div
            class="w-8 h-8 sm:w-10 sm:h-10 border-4 border-white border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <!-- Main Content -->
        <div
          class="bg-white/80 backdrop-blur-sm py-8 px-6 sm:py-10 sm:px-8 shadow-xl border border-white/20 rounded-2xl"
        >
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Signing in to Microsoft</h2>
          <p class="text-gray-600 mb-6">
            Please wait while we authenticate you with your Microsoft account.
          </p>

          <p class="text-sm text-gray-500">This may take a few moments...</p>
        </div>

        <!-- Footer -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500">BBB Partners Portal</p>
        </div>
      </div>
    </div>
  `,
})
export class MicrosoftCallbackComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];

      if (code) {
        // Send the code to backend for exchange
        this.authService.handleMicrosoftCallback(code).subscribe({
          next: (response) => {
            // Save authentication data to localStorage
            this.authService.saveAuthData(response);
            toast.success('Signed in successfully');

            // Navigate based on user role
            this.navigateBasedOnRole();
          },
          error: (error) => {
            console.error('Authentication error:', error);
            // Redirect to login page on error
            toast.error('Authentication error');
            this.router.navigate(['/login']);
          },
        });
      } else {
        console.error('No authorization code received');
        toast.error('No authorization code received');
        // Redirect to login page if no code
        this.router.navigate(['/login']);
      }
    });
  }

  private navigateBasedOnRole(): void {
    // Get user role from the saved auth data
    const userRole = this.authService.userRole();
    if (userRole === 'Internal') {
      // Navigate to internal dashboard
      this.router.navigate(['/dashboard/internal/overview']);
    } else if (userRole) {
      // For external roles, convert to kebab-case and navigate to external dashboard
      this.router.navigate([`/dashboard/overview`]);
    } else {
      // Fallback to user profile if no role found
      this.router.navigate(['/404']);
    }
  }
}
