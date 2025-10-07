import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardHeaderComponent } from '../../../../../shared/components/dashboard-header/dashboard-header.component';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import {
  PARTNERSHIP_SOURCE,
  getPartnershipDisplayName,
  PartnershipSource,
} from '../../../../accreditation-form/models/partnership-sources.model';

@Component({
  selector: 'app-contractors',
  templateUrl: './contractors.component.html',
  imports: [DashboardHeaderComponent, HlmCardImports, HlmButton],
})
export class ContractorsComponent {
  router = inject(Router);

  // Expose navigator and window for template
  navigator = navigator;
  window = window;

  // Get all partnership sources
  partnershipSources = Object.keys(PARTNERSHIP_SOURCE) as PartnershipSource[];

  getDisplayName(source: PartnershipSource): string {
    return getPartnershipDisplayName(source);
  }

  getFormUrl(source: PartnershipSource): string {
    const sourceId = source
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    return `/business-registration/${sourceId}`;
  }
}
