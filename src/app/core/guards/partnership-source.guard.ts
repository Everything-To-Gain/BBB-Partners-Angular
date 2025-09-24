import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
  VALID_PARTNERSHIP_SOURCES,
  convertToPascalCase,
} from '../../features/accreditation-form/models/partnership-sources.model';

export const partnershipSourceGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean => {
  const router = inject(Router);
  const id = route.paramMap.get('id');
  const pascalCaseId = id ? convertToPascalCase(id) : null;

  if (!id || !pascalCaseId || !VALID_PARTNERSHIP_SOURCES.includes(pascalCaseId as any)) {
    router.navigate(['/404']);
    return false;
  }
  return true;
};
