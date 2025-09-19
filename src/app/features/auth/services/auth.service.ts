import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  loginWithMicrosoft() {
    window.location.href = `${this.apiUrl}/auth/microsoft-login`;
  }

  loginWithGoogle() {
    window.location.href = `${this.apiUrl}/auth/google-login`;
  }
}
