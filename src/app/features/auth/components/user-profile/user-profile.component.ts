import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-user-profile',
  template: `
    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-4">User Profile</h2>

      <!-- Authentication Status -->
      <div class="mb-4">
        <span class="font-semibold">Status: </span>
        @if (authService.isAuthenticated()) {
        <span class="text-green-600">✅ Authenticated</span>
        } @else {
        <span class="text-red-600">❌ Not Authenticated</span>
        }
      </div>

      <!-- User Information -->
      @if (authService.isAuthenticated()) {
      <div class="space-y-2">
        <div>
          <span class="font-semibold">Name: </span>
          <span>{{ authService.userName() }}</span>
        </div>

        <div>
          <span class="font-semibold">Email: </span>
          <span>{{ authService.userEmail() }}</span>
        </div>

        <div>
          <span class="font-semibold">Role: </span>
          <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {{ authService.userRole() }}
          </span>
        </div>

        <div>
          <span class="font-semibold">Token: </span>
          <span class="text-xs text-gray-500 break-all">
            {{ authService.token()?.substring(0, 50) }}...
          </span>
        </div>
      </div>

      <!-- Test API Button -->
      <button
        (click)="testApi()"
        class="mt-4 mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Test API Call
      </button>

      <!-- Logout Button -->
      <button
        (click)="logout()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
      } @else {
      <div class="text-gray-600">
        <p>Please log in to view your profile.</p>
        <button
          (click)="login()"
          class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Login with Google
        </button>
      </div>
      }
    </div>
  `,
})
export class UserProfileComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }

  login(): void {
    window.location.href = this.authService.getGoogleLoginUrl();
  }

  testApi(): void {
    this.authService.testAuthenticatedRequest().subscribe({
      next: (response) => {
        toast.success('API call successful! Check network tab to see Authorization header.');
        console.log('API Response:', response);
      },
      error: (error) => {
        toast.error('API call failed. Check console for details.');
        console.error('API Error:', error);
      },
    });
  }
}
