import { Routes } from '@angular/router';
import { AccreditationFormComponent } from './features/accreditation-form/pages/accreditation-form.component';
import { TrackApplicationComponent } from './features/track-application/pages/track-application.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { partnershipSourceGuard } from './core/guards/partnership-source.guard';
import { AuthCallbackComponent } from './features/auth/pages/auth-callback/google-callback.component';
import { UserProfileComponent } from './features/auth/components/user-profile/user-profile.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    title: 'Accreditation Form',
    path: 'accreditation-form/:id',
    component: AccreditationFormComponent,
    canActivate: [partnershipSourceGuard],
  },
  {
    title: 'Track Application',
    path: 'track-application/:id',
    component: TrackApplicationComponent,
  },
  {
    title: 'Login',
    path: 'login',
    component: LoginComponent,
  },
  {
    title: 'Google Callback',
    path: 'auth/google-callback',
    component: AuthCallbackComponent,
  },
  {
    title: 'User Profile',
    path: 'user-profile',
    component: UserProfileComponent,
  },
  {
    title: 'Page Not Found',
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
