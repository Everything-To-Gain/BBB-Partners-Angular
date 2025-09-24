import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <div class="text-lg">Signing in to Google...</div>
      <div class="mt-4 text-sm text-gray-600">Please wait while we authenticate you.</div>
    </div>
  `,
})
export class AuthCallbackComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];

      if (code) {
        // Send the code to backend for exchange
        this.authService.handleGoogleCallback(code).subscribe({
          next: (response) => {
            // Save authentication data to localStorage
            this.authService.saveAuthData(response);
            toast.success('Signed in successfully');
            // Redirect to dashboard or home page after successful authentication
            this.router.navigate(['/user-profile']); // Adjust the route as needed
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
}
