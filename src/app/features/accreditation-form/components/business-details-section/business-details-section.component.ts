import { Component, inject, input, output, signal, OnDestroy } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmError } from '@spartan-ng/helm/form-field';
import { HlmFormField } from '@spartan-ng/helm/form-field';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AccreditationFormService } from '../../services/accreditation-form.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronsUpDown,
  lucideSearch,
  lucideCheck,
  lucidePlus,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';
import { HlmDatePicker } from '@spartan-ng/helm/date-picker';
import { TobItem } from '../../models/tob.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { HlmHint } from '@spartan-ng/helm/form-field';
@Component({
  selector: 'app-business-details-section',
  imports: [
    ReactiveFormsModule,
    HlmInput,
    HlmLabel,
    HlmCardImports,
    HlmError,
    HlmFormField,
    BrnSelectImports,
    HlmSelectImports,
    BrnCommandImports,
    HlmCommandImports,
    NgIcon,
    HlmIcon,
    HlmButton,
    BrnPopover,
    BrnPopoverTrigger,
    HlmPopoverContent,
    BrnPopoverContent,
    HlmHint,
    HlmDatePicker,
  ],
  providers: [
    provideIcons({ lucideChevronsUpDown, lucideSearch, lucideCheck, lucidePlus, lucideTrash2 }),
  ],
  templateUrl: './business-details-section.component.html',
})
export class BusinessDetailsSectionComponent implements OnDestroy {
  accreditationFormService = inject(AccreditationFormService);
  form = input.required<FormGroup>();

  // Output events for licenses
  addLicense = output<void>();
  removeLicense = output<number>();

  // Icons
  plusIcon = lucidePlus;
  trashIcon = lucideTrash2;
  tobItems = signal<TobItem[]>([]);
  currentTob = signal<TobItem | undefined>(undefined);
  public state = signal<'closed' | 'open'>('closed');
  minDate = new Date();

  entityTypes: string[] = [
    'Charity/NonProfit',
    'Common-Law Trust',
    'Complaint Transfer Agency',
    'Cooperative Association',
    'Corporation',
    'Franchisee',
    'Franchisor',
    'Government',
    'Limited Liability Corporation (LLC)',
    'Limited Liability Partnership (LLP)',
    'Partnership',
    'Private Limited Company by Shares (LTD)',
    'Professional Association (PA)',
    'Professional Corporation',
    'Professional Limited Liability Company (PLLC)',
    'Public Benefit Corporation/Benefit Corporation',
    'Referral Agency',
    'Sole Proprietor',
    'Unincorporated Association',
    'Unknown',
  ];

  ranges: string[] = [
    '1-499',
    '500-49,999',
    '50,000-99,999',
    '100,000-999,999',
    '1,000,000-9,999,999',
    '10,000,000-49,999,999',
    '50,000,000 or more',
  ];

  // Debounced search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor() {
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value actually changed
        switchMap((searchTerm) => {
          if (!searchTerm.trim()) {
            // If search is empty, return all items
            return this.accreditationFormService.getVisualData();
          }
          return this.accreditationFormService.getVisualData(searchTerm);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        if (response.success) {
          this.tobItems.set(response.data ?? []);
        }
      });
  }

  stateChanged(state: 'open' | 'closed') {
    this.state.set(state);
  }

  commandSelected(tob: TobItem) {
    this.state.set('closed');
    if (this.currentTob()?.cbbbId === tob.cbbbId) {
      this.currentTob.set(undefined);
      this.form().get('businessType')?.setValue('');
    } else {
      console.log(tob);
      this.form().get('businessType')?.setValue(tob.cbbbId);
      this.currentTob.set(tob);
    }
  }

  commandSearch(value: string) {
    this.searchSubject.next(value);
  }

  ngOnInit() {
    // Load initial data
    this.accreditationFormService.getVisualData().subscribe((response) => {
      if (response.success) {
        this.tobItems.set(response.data ?? []);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  get licenses(): FormArray {
    return this.form().get('licenses') as FormArray;
  }
}
