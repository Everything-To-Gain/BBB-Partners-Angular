import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  continueWithMicrosoft() {
    this.authService.loginWithMicrosoft();
  }

  continueWithGoogle() {
    window.location.href = this.authService.getGoogleLoginUrl();
  }
}
