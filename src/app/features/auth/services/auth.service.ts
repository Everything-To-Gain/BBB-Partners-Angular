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
  specialAccess?: string;
  isAdmin?: string;
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
  private microsoftRedirectUri = `${environment.frontUrl}/auth/microsoft-callback`;

  // Store only the token
  private tokenSignal = signal<string | null>(null);

  // Public readonly signals - decode token on demand
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly userEmail = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    const decoded = this.decodeJwtToken(token);
    return decoded?.email || null;
  });
  readonly userRole = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    const decoded = this.decodeJwtToken(token);
    return decoded?.role || null;
  });
  readonly isAdmin = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    const decoded = this.decodeJwtToken(token);
    return decoded?.isAdmin || null;
  });
  readonly userName = computed(() => {
    const email = this.userEmail();
    if (!email) return null;
    // Extract name from email (part before @)
    return email
      .split('@')[0]
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  });
  readonly specialAccess = computed(() => {
    const token = this.tokenSignal();
    if (!token) return null;
    const decoded = this.decodeJwtToken(token);
    return decoded?.specialAccess || null;
  });

  constructor() {
    // Initialize auth data from localStorage on service creation
    this.initializeAuthFromStorage();
    console.log(this.googleRedirectUri);
  }

  // Initialize authentication data from localStorage
  private initializeAuthFromStorage(): void {
    const storedToken = localStorage.getItem('authToken');

    if (storedToken) {
      // Verify token is still valid by decoding it
      const decoded = this.decodeJwtToken(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        this.tokenSignal.set(storedToken);
      } else {
        // Token expired, clear storage
        this.clearStorage();
      }
    }
  }

  loginWithMicrosoft() {
    window.location.href = this.getMicrosoftLoginUrl();
  }

  getMicrosoftLoginUrl(): string {
    const microsoftClientId = environment.microsoftClientId;
    const microsoftTenantId = environment.microsoftTenantId;
    const microsoftRedirectUri = this.microsoftRedirectUri;

    const state = crypto.randomUUID().replace(/-/g, '');

    const url = new URL(
      `https://login.microsoftonline.com/${microsoftTenantId}/oauth2/v2.0/authorize`
    );
    url.searchParams.set('client_id', microsoftClientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', microsoftRedirectUri);
    url.searchParams.set('response_mode', 'query');
    url.searchParams.set('scope', 'openid profile email offline_access User.Read');
    url.searchParams.set('state', state);

    return url.toString();
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

  handleMicrosoftCallback(code: string): Observable<AuthCallbackResponse> {
    return this.http.get<AuthCallbackResponse>(`${this.apiUrl}/auth/microsoft-callback`, {
      params: { code, redirectUrl: this.microsoftRedirectUri },
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
      // Update signal
      this.tokenSignal.set(response.token);

      // Save only token to localStorage
      localStorage.setItem('authToken', response.token);

      console.log('Authentication data saved - token only');
    } else {
      console.error('Failed to decode token, authentication data not saved');
    }
  }

  // Get authentication data from localStorage (legacy method - use signals instead)
  getAuthData(): AuthData | null {
    const token = localStorage.getItem('authToken');

    if (!token) return null;

    const decoded = this.decodeJwtToken(token);
    if (!decoded) return null;

    // Generate userName from email
    const email = decoded.email;
    const userName = email
      ? email
          .split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : '';

    return {
      token,
      userName,
      email: decoded.email,
      role: decoded.role,
    };
  }

  // Clear storage helper
  private clearStorage(): void {
    localStorage.removeItem('authToken');
  }

  // Logout and clear authentication data
  logout(): void {
    // Clear signal
    this.tokenSignal.set(null);

    // Clear localStorage
    this.clearStorage();
  }

  // Test method to verify interceptor is working
  testAuthenticatedRequest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/validate`);
  }
}
