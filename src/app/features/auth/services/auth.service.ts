import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

interface AuthCallbackResponse {
  status: string;
  message: string;
  token: string;
  userName: string;
}

interface DecodedToken {
  email: string;
  role: string;
  nbf: number;
  exp: number;
  iat: number;
}

interface AuthData {
  token: string;
  userName: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private googleRedirectUri = `${environment.frontUrl}/auth/google-callback`;

  // Authentication state signals
  private authDataSignal = signal<AuthData | null>(null);

  // Public readonly signals
  readonly authData = this.authDataSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.authDataSignal());
  readonly userEmail = computed(() => this.authDataSignal()?.email || null);
  readonly userRole = computed(() => this.authDataSignal()?.role || null);
  readonly userName = computed(() => this.authDataSignal()?.userName || null);
  readonly token = computed(() => this.authDataSignal()?.token || null);

  constructor() {
    // Initialize auth data from localStorage on service creation
    this.initializeAuthFromStorage();
  }

  // Initialize authentication data from localStorage
  private initializeAuthFromStorage(): void {
    const storedAuthData = localStorage.getItem('authData');
    if (storedAuthData) {
      try {
        const authData = JSON.parse(storedAuthData) as AuthData;
        this.authDataSignal.set(authData);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        localStorage.removeItem('authData');
      }
    }
  }

  loginWithMicrosoft() {
    window.location.href = `${this.apiUrl}/auth/microsoft-login`;
  }

  getGoogleLoginUrl(): string {
    const googleClientId = environment.googleClientId;

    const state = crypto.randomUUID();

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', googleClientId);
    url.searchParams.set('redirect_uri', this.googleRedirectUri);
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);

    return url.toString();
  }

  handleGoogleCallback(code: string): Observable<AuthCallbackResponse> {
    return this.http.get<AuthCallbackResponse>(`${this.apiUrl}/auth/google-callback`, {
      params: { code, redirectUrl: this.googleRedirectUri },
    });
  }

  // Decode JWT token without verification (client-side only)
  private decodeJwtToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Save authentication data to localStorage and signal
  saveAuthData(response: AuthCallbackResponse): void {
    const decodedToken = this.decodeJwtToken(response.token);

    if (decodedToken) {
      const authData: AuthData = {
        token: response.token,
        userName: response.userName,
        email: decodedToken.email,
        role: decodedToken.role,
      };

      // Update signal
      this.authDataSignal.set(authData);

      // Save to localStorage
      localStorage.setItem('authData', JSON.stringify(authData));
      console.log('Authentication data saved:', authData);
    } else {
      console.error('Failed to decode token, authentication data not saved');
    }
  }

  // Get authentication data from localStorage (legacy method - use signals instead)
  getAuthData(): AuthData | null {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData) : null;
  }

  // Logout and clear authentication data
  logout(): void {
    // Clear signal
    this.authDataSignal.set(null);

    // Clear localStorage
    localStorage.removeItem('authData');
  }

  // Test method to verify interceptor is working
  testAuthenticatedRequest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/validate`);
  }
}
