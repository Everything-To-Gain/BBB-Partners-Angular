import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

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
    this.authService.loginWithGoogle();
  }
}
