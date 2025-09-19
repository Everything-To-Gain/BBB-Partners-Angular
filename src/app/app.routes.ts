import { Routes } from '@angular/router';
import { AccreditationFormComponent } from './features/accreditation-form/pages/accreditation-form.component';
import { TrackApplicationComponent } from './features/track-application/pages/track-application.component';
import { LoginComponent } from './features/auth/pages/login.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    redirectTo: 'accreditation-form',
    pathMatch: 'full',
  },
  {
    title: 'Accreditation Form',
    path: 'accreditation-form',
    component: AccreditationFormComponent,
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
];
