import { Routes } from '@angular/router';
import { AccreditationFormComponent } from './features/accreditation-form/pages/accreditation-form.component';
import { TrackApplicationComponent } from './features/track-application/pages/track-application.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { partnershipSourceGuard } from './core/guards/partnership-source.guard';
import { AuthCallbackComponent } from './features/auth/pages/auth-callback/google-callback.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { InternalOverviewComponent } from './features/dashboard/internal/pages/internal-overview/internal-overview.component';
import { ExternalOverviewComponent } from './features/dashboard/external/pages/external-overview/external-overview.component';
import { SuccessfullSubmissionComponent } from './features/accreditation-form/pages/successfull-submission/successfull-submission.component';
import { InternalApplicationDetailsComponent } from './features/dashboard/internal/pages/internal-application-details/internal-application-details.component';
import { MicrosoftCallbackComponent } from './features/auth/pages/auth-callback/microsoft-callback.component';

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
    title: 'Submission Successful',
    path: 'submission-success',
    component: SuccessfullSubmissionComponent,
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
    title: 'Microsoft Callback',
    path: 'auth/microsoft-callback',
    component: MicrosoftCallbackComponent,
  },
  {
    title: 'Page Not Found',
    path: '404',
    component: NotFoundComponent,
  },
  {
    title: 'External Overview',
    path: 'dashboard/overview',
    component: ExternalOverviewComponent,
  },
  {
    title: 'Internal Overview',
    path: 'dashboard/internal/overview',
    component: InternalOverviewComponent,
  },
  {
    title: 'Internal Application Details',
    path: 'dashboard/internal/application-details/:id',
    component: InternalApplicationDetailsComponent,
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
