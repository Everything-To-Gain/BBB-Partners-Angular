import { Component, inject, input, signal, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmError } from '@spartan-ng/helm/form-field';
import { HlmFormField } from '@spartan-ng/helm/form-field';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { AccreditationFormService } from '../../services/accreditation-form.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown, lucideSearch, lucideCheck } from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { HlmButton } from '@spartan-ng/helm/button';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';
import { TobItem } from '../../models/tob.model';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';

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
  ],
  providers: [provideIcons({ lucideChevronsUpDown, lucideSearch, lucideCheck })],
  templateUrl: './business-details-section.component.html',
})
export class BusinessDetailsSectionComponent implements OnDestroy {
  accreditationFormService = inject(AccreditationFormService);

  form = input.required<FormGroup>();
  tobItems = signal<TobItem[]>([]);
  currentTob = signal<TobItem | undefined>(undefined);
  public state = signal<'closed' | 'open'>('closed');

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
}
