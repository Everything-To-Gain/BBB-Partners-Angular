import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [HlmButton, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | null | undefined>();

  userName = input<string | null | undefined>();
  userEmail = input<string | null | undefined>();
  userRole = input<string | null | undefined>();
  isAdmin = input<boolean>(false);

  logout = output<void>();
}
