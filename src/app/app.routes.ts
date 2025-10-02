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
import { getDisplayNameFromRouteId } from './features/accreditation-form/models/partnership-sources.model';
import { AdminDashboardMainComponent } from './features/dashboard/admin-dashboard/pages/main/admin-dashboard-main.component';
import { AuditDashboardMainComponent } from './features/dashboard/audit-dashboard/pages/main/audit-dashboard-main.component';
import { AuditDetailsComponent } from './features/dashboard/audit-dashboard/pages/audit-details/audit-details.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    title: (route) =>
      `Business Information Form – ${getDisplayNameFromRouteId(route.paramMap.get('id'))}`,
    path: 'business-registration/:id',
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
    title: 'Admin Dashboard',
    path: 'dashboard/admin/overview',
    component: AdminDashboardMainComponent,
  },
  {
    title: 'Audit Dashboard',
    path: 'dashboard/audit/overview',
    component: AuditDashboardMainComponent,
  },
  {
    title: 'Audit Details',
    path: 'dashboard/audit/details/:id',
    component: AuditDetailsComponent,
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
