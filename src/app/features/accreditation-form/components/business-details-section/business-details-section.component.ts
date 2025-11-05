import {
  Component,
  inject,
  input,
  output,
  signal,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
  lucideX,
} from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';
import { TobItem } from '../../models/tob.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
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
  ],
  providers: [
    provideIcons({
      lucideChevronsUpDown,
      lucideSearch,
      lucideCheck,
      lucidePlus,
      lucideTrash2,
      lucideX,
    }),
  ],
  templateUrl: './business-details-section.component.html',
})
export class BusinessDetailsSectionComponent implements OnInit, OnDestroy {
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

  // Secondary business types (multiple select)
  selectedSecondaryTobs = signal<TobItem[]>([]);
  public secondaryState = signal<'closed' | 'open'>('closed');
  private secondarySearchSubject = new Subject<string>();
  secondaryTobItems = signal<TobItem[]>([]); // Separate items list for secondary dropdown
  private allTobItems = signal<TobItem[]>([]); // Store all items for secondary
  secondarySearchValue = signal<string>(''); // Track search value to reset it

  @ViewChild('businessTypeTrigger', { static: false }) businessTypeTrigger!: ElementRef;
  @ViewChild('secondaryBusinessTypeTrigger', { static: false })
  secondaryBusinessTypeTrigger!: ElementRef;

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
    // Set up debounced search for primary business type
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

    // Set up debounced search for secondary business types
    this.secondarySearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm.trim()) {
            // If search is empty, return all items (from stored list) as Observable
            const allItems = this.allTobItems();
            return of({ success: true, data: allItems } as any);
          }
          // Search from all items, not filtered list
          return this.accreditationFormService.getVisualData(searchTerm);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        if (response?.success) {
          this.secondaryTobItems.set(response.data ?? []);
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
      // Clear secondary business types when primary is cleared
      this.selectedSecondaryTobs.set([]);
      this.form().get('secondaryBusinessTypes')?.setValue([]);
    } else {
      this.form().get('businessType')?.setValue(tob.cbbbId);
      this.currentTob.set(tob);

      // Remove the newly selected primary from secondary selections if it exists
      const currentSecondary = this.selectedSecondaryTobs();
      const updatedSecondary = currentSecondary.filter((item) => item.cbbbId !== tob.cbbbId);
      if (updatedSecondary.length !== currentSecondary.length) {
        this.selectedSecondaryTobs.set(updatedSecondary);
        this.form()
          .get('secondaryBusinessTypes')
          ?.setValue(updatedSecondary.map((item) => item.cbbbId));
      }
    }
  }

  commandSearch(value: string) {
    this.searchSubject.next(value);
  }

  // Secondary business types methods
  secondaryStateChanged(state: 'open' | 'closed') {
    this.secondaryState.set(state);
    if (state === 'open') {
      // Reset secondary items to show all when opening (clear any previous search)
      this.secondaryTobItems.set(this.allTobItems());
      // Clear the search value and reset the search subject
      this.secondarySearchValue.set('');
      this.secondarySearchSubject.next('');
    }
  }

  secondaryCommandSelected(tob: TobItem) {
    const currentSelected = this.selectedSecondaryTobs();
    const isSelected = currentSelected.some((item) => item.cbbbId === tob.cbbbId);

    if (isSelected) {
      // Remove from selection
      const updated = currentSelected.filter((item) => item.cbbbId !== tob.cbbbId);
      this.selectedSecondaryTobs.set(updated);
      this.form()
        .get('secondaryBusinessTypes')
        ?.setValue(updated.map((item) => item.cbbbId));
    } else {
      // Add to selection
      const updated = [...currentSelected, tob];
      this.selectedSecondaryTobs.set(updated);
      this.form()
        .get('secondaryBusinessTypes')
        ?.setValue(updated.map((item) => item.cbbbId));
    }
  }

  secondaryCommandSearch(value: string) {
    this.secondarySearchValue.set(value);
    this.secondarySearchSubject.next(value);
    // If search is cleared, reset to all items
    if (!value.trim()) {
      this.secondaryTobItems.set(this.allTobItems());
    }
  }

  // Check if a secondary TOB is selected
  isSecondaryTobSelected(cbbbId: string): boolean {
    return this.selectedSecondaryTobs().some((item) => item.cbbbId === cbbbId);
  }

  // Get display text for secondary business types
  getSecondaryTobsDisplayText(): string {
    const selected = this.selectedSecondaryTobs();
    if (selected.length === 0) {
      return 'Select Secondary Business Types...';
    }
    if (selected.length === 1) {
      return selected[0].name;
    }
    return `${selected.length} types selected`;
  }

  // Remove a secondary business type from selection
  removeSecondaryTob(tobToRemove: TobItem) {
    const updated = this.selectedSecondaryTobs().filter((tob) => tob.cbbbId !== tobToRemove.cbbbId);
    this.selectedSecondaryTobs.set(updated);
    this.form()
      .get('secondaryBusinessTypes')
      ?.setValue(updated.map((item) => item.cbbbId));
  }

  // Check if businessType is selected (for enabling/disabling secondary)
  isBusinessTypeSelected(): boolean {
    return !!this.form().get('businessType')?.value;
  }

  // Get trigger width for popover content
  getBusinessTypeTriggerWidth(): number {
    return this.businessTypeTrigger?.nativeElement?.offsetWidth || 300;
  }

  getSecondaryBusinessTypeTriggerWidth(): number {
    return this.secondaryBusinessTypeTrigger?.nativeElement?.offsetWidth || 300;
  }

  // Get filtered TOB items for secondary (excluding the primary selection)
  getSecondaryTobItems(): TobItem[] {
    const primaryCbbbId = this.form().get('businessType')?.value;
    const items = this.secondaryTobItems(); // Use secondary-specific items
    if (!primaryCbbbId) {
      return items;
    }
    return items.filter((tob) => tob.cbbbId !== primaryCbbbId);
  }

  ngOnInit() {
    // Load initial data for primary dropdown
    this.accreditationFormService.getVisualData().subscribe((response) => {
      if (response.success) {
        this.tobItems.set(response.data ?? []);
        // Store all items for secondary dropdown
        this.allTobItems.set(response.data ?? []);
        this.secondaryTobItems.set(response.data ?? []);
      }
    });

    // Initialize secondary business types from form value
    const secondaryBusinessTypesValue = this.form().get('secondaryBusinessTypes')?.value;
    if (Array.isArray(secondaryBusinessTypesValue) && secondaryBusinessTypesValue.length > 0) {
      // Load TOB items and match them
      this.accreditationFormService.getVisualData().subscribe((response) => {
        if (response.success && response.data) {
          const matched = response.data.filter((tob) =>
            secondaryBusinessTypesValue.includes(tob.cbbbId)
          );
          this.selectedSecondaryTobs.set(matched);
        }
      });
    }

    // Watch for businessType changes to enable/disable secondary and remove conflicts
    this.form()
      .get('businessType')
      ?.valueChanges.subscribe((newPrimaryValue) => {
        if (!newPrimaryValue) {
          // Clear secondary if primary is cleared
          this.selectedSecondaryTobs.set([]);
          this.form().get('secondaryBusinessTypes')?.setValue([]);
        } else {
          // Remove the new primary value from secondary selections if it exists
          const currentSecondary = this.selectedSecondaryTobs();
          const updatedSecondary = currentSecondary.filter(
            (item) => item.cbbbId !== newPrimaryValue
          );
          if (updatedSecondary.length !== currentSecondary.length) {
            this.selectedSecondaryTobs.set(updatedSecondary);
            this.form()
              .get('secondaryBusinessTypes')
              ?.setValue(updatedSecondary.map((item) => item.cbbbId));
          }

          // Also update currentTob if needed
          const matchingTob = this.tobItems().find((tob) => tob.cbbbId === newPrimaryValue);
          if (matchingTob) {
            this.currentTob.set(matchingTob);
          }
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
