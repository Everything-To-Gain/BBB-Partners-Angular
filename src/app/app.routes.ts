import { Routes } from '@angular/router';
import { AccreditationFormComponent } from './features/accreditation-form/pages/accreditation-form.component';
import { AlphaFormComponent } from './features/alpha-form/pages/alpha-form/alpha-form.component';
import { TrackApplicationComponent } from './features/track-application/pages/track-application.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { partnershipSourceGuard } from './core/guards/partnership-source.guard';
import { AuthCallbackComponent } from './features/auth/pages/auth-callback/google-callback.component';
import { NotFoundComponent } from './core/pages/not-found/not-found.component';
import { InternalOverviewComponent } from './features/dashboard/internal/pages/internal-overview/internal-overview.component';
import { ExternalAdminsComponent } from './features/dashboard/internal/pages/external-admins/external-admins.component';
import { ExternalOverviewComponent } from './features/dashboard/external/pages/external-overview/external-overview.component';
import { SuccessfullSubmissionComponent } from './features/accreditation-form/pages/successfull-submission/successfull-submission.component';
import { InternalApplicationDetailsComponent } from './features/dashboard/internal/pages/internal-application-details/internal-application-details.component';
import { MicrosoftCallbackComponent } from './features/auth/pages/auth-callback/microsoft-callback.component';
import { getDisplayNameFromRouteId } from './features/accreditation-form/models/partnership-sources.model';
import { AdminDashboardMainComponent } from './features/dashboard/admin-dashboard/pages/main/admin-dashboard-main.component';
import { AuditDashboardMainComponent } from './features/dashboard/audit-dashboard/pages/main/audit-dashboard-main.component';
import { AuditDetailsComponent } from './features/dashboard/audit-dashboard/pages/audit-details/audit-details.component';
import { ContractorsComponent } from './features/dashboard/internal/pages/contractors/contractors.component';
import { AdminAuthGuard } from './core/guards/admin-auth.guard';
import { InternalAuthGuard } from './core/guards/internal-auth.guard';
import { redirectIfAuthenticated } from './core/guards/redirect-if-authenticated.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    title: (route) =>
      `Business Information Form - ${getDisplayNameFromRouteId(route.paramMap.get('id'))}`,
    path: 'business-registration/:id',
    component: AccreditationFormComponent,
    canActivate: [partnershipSourceGuard],
  },
  {
    title: 'Business Information Form - Alpha',
    path: 'alpha-form',
    component: AlphaFormComponent,
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
    canActivate: [redirectIfAuthenticated],
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
    title: 'External Overview',
    path: 'dashboard/overview',
    component: ExternalOverviewComponent,
  },
  {
    title: 'Internal Overview',
    path: 'dashboard/internal/overview',
    component: InternalOverviewComponent,
    canActivate: [InternalAuthGuard],
  },
  {
    title: 'External Admins',
    path: 'dashboard/external/overview',
    component: ExternalAdminsComponent,
    canActivate: [InternalAuthGuard],
  },
  {
    title: 'Internal Application Details',
    path: 'dashboard/internal/application-details/:id',
    component: InternalApplicationDetailsComponent,
    canActivate: [InternalAuthGuard],
  },
  {
    title: 'Admin Dashboard',
    path: 'dashboard/admin/overview',
    component: AdminDashboardMainComponent,
    canActivate: [AdminAuthGuard],
  },
  {
    title: 'Audit Dashboard',
    path: 'dashboard/audit/overview',
    component: AuditDashboardMainComponent,
    canActivate: [InternalAuthGuard],
  },
  {
    title: 'Audit Details',
    path: 'dashboard/audit/details/:id',
    component: AuditDetailsComponent,
    canActivate: [InternalAuthGuard],
  },
  {
    title: 'Contractors',
    path: 'dashboard/internal/contractors',
    component: ContractorsComponent,
    canActivate: [InternalAuthGuard],
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
