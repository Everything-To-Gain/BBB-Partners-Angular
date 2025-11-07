import { Component, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import {
  lucideBuilding,
  lucideUsers,
  lucideFileText,
  lucideAward,
  lucidePlus,
  lucideTrash2,
  lucideChevronsUpDown,
  lucideSearch,
  lucideCheck,
  lucideX,
  lucideShield,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import {
  FormGroup,
  FormControl,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { toast } from 'ngx-sonner';
import { HlmFormField, HlmError, HlmHint } from '@spartan-ng/helm/form-field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { BrnPopover, BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';

interface TobItem {
  cbbbId: string;
  name: string;
}

@Component({
  selector: 'app-alpha-form',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmIcon,
    ...HlmCardImports,
    HlmButton,
    HlmFormField,
    HlmInput,
    HlmError,
    HlmLabel,
    HlmCheckbox,
    HlmHint,
    BrnSelectImports,
    HlmSelectImports,
    BrnCommandImports,
    HlmCommandImports,
    BrnPopover,
    BrnPopoverTrigger,
    HlmPopoverContent,
    BrnPopoverContent,
  ],
  providers: [
    provideIcons({
      lucideBuilding,
      lucideUsers,
      lucideFileText,
      lucideAward,
      lucidePlus,
      lucideTrash2,
      lucideChevronsUpDown,
      lucideSearch,
      lucideCheck,
      lucideX,
      lucideShield,
    }),
  ],
  templateUrl: './alpha-form.component.html',
})
export class AlphaFormComponent implements OnInit {
  today = new Date().toISOString().split('T')[0];

  // Business type dropdown state
  tobItems = signal<TobItem[]>([]);
  currentTob = signal<TobItem | undefined>(undefined);
  public state = signal<'closed' | 'open'>('closed');
  selectedSecondaryTobs = signal<TobItem[]>([]);
  public secondaryState = signal<'closed' | 'open'>('closed');
  secondaryTobItems = signal<TobItem[]>([]);
  private allTobItems = signal<TobItem[]>([]);
  secondarySearchValue = signal<string>('');

  @ViewChild('businessTypeTrigger', { static: false }) businessTypeTrigger!: ElementRef;
  @ViewChild('secondaryBusinessTypeTrigger', { static: false })
  secondaryBusinessTypeTrigger!: ElementRef;

  // Static list of common business types (simplified version without service)
  private staticBusinessTypes: TobItem[] = [
    { cbbbId: '1', name: 'Roofing Contractor' },
    { cbbbId: '2', name: 'General Contractor' },
    { cbbbId: '3', name: 'Plumbing' },
    { cbbbId: '4', name: 'Electrical' },
    { cbbbId: '5', name: 'HVAC' },
    { cbbbId: '6', name: 'Landscaping' },
    { cbbbId: '7', name: 'Painting' },
    { cbbbId: '8', name: 'Flooring' },
    { cbbbId: '9', name: 'Window Installation' },
    { cbbbId: '10', name: 'Siding' },
    { cbbbId: '11', name: 'Gutter Services' },
    { cbbbId: '12', name: 'Deck Building' },
    { cbbbId: '13', name: 'Fence Installation' },
    { cbbbId: '14', name: 'Concrete Work' },
    { cbbbId: '15', name: 'Masonry' },
    { cbbbId: '16', name: 'Drywall' },
    { cbbbId: '17', name: 'Carpentry' },
    { cbbbId: '18', name: 'Kitchen Remodeling' },
    { cbbbId: '19', name: 'Bathroom Remodeling' },
    { cbbbId: '20', name: 'Home Improvement' },
  ];

  states: string[] = [
    'Alabama',
    'Alaska',
    'American Samoa',
    'Arizona',
    'Arkansas',
    'Armed Forces Americas (except Canada)',
    'Armed Forces Pacific',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Federated States of Micronesia',
    'Florida',
    'Georgia',
    'Guam',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Marshall Islands',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Northern Mariana Islands',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Palau',
    'Pennsylvania',
    'Puerto Rico',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virgin Islands',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ];

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

  // Create the form with all fields using FormGroup and FormControl
  accreditationForm: FormGroup = new FormGroup({
    // Business Information
    businessName: new FormControl('', [Validators.required]),
    doingBusinessAs: new FormControl(''),
    businessAddress: new FormControl('', [Validators.required]),
    businessAptSuite: new FormControl(''),
    businessState: new FormControl('', [Validators.required]),
    businessCity: new FormControl('', [Validators.required]),
    businessZip: new FormControl('', [Validators.required]),
    sameAsBusinessAddress: new FormControl(true),
    mailingAddress: new FormControl(''),
    mailingAptSuite: new FormControl(''),
    mailingCity: new FormControl(''),
    mailingState: new FormControl(''),
    mailingZip: new FormControl(''),
    hasMultipleLocations: new FormControl(false),
    numberOfLocations: new FormControl(''),

    // Business Contact Information
    primaryBusinessPhone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    primaryBusinessEmail: new FormControl('', [Validators.required, Validators.email]),
    emailToReceiveQuoteRequestsFromCustomers: new FormControl(''),
    website: new FormControl(''),
    socialMediaLinks: new FormArray([]),

    // Primary Contact Information
    primaryFirstName: new FormControl('', [Validators.required]),
    primaryLastName: new FormControl('', [Validators.required]),
    primaryTitle: new FormControl('', [Validators.required]),
    primaryDateOfBirth: new FormControl(null, [Validators.required]),
    primaryContactEmail: new FormControl('', [Validators.required, Validators.email]),
    primaryContactNumber: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10}$/),
    ]),
    preferredContactMethod: new FormControl('', [Validators.required]),
    primaryContactTypes: new FormControl([]),

    // Secondary Contact Information
    secondaryFirstName: new FormControl(''),
    secondaryLastName: new FormControl(''),
    secondaryTitle: new FormControl(''),
    secondaryEmail: new FormControl(''),
    secondaryContactTypes: new FormControl([]),
    secondaryPhone: new FormControl('', [Validators.pattern(/^\d{10}$/)]),
    secondaryPreferredContactMethod: new FormControl(''),

    // Business Details and Licensing
    businessDescription: new FormControl('', [Validators.required]),
    businessServiceArea: new FormControl('', [Validators.required]),
    ein: new FormControl(''),
    businessType: new FormControl('', [Validators.required]),
    secondaryBusinessTypes: new FormControl([]),
    businessEntityType: new FormControl('', [Validators.required]),
    businessStartDate: new FormControl(null, [Validators.required]),

    // Licensing and certifications
    licenses: new FormArray([]),

    // Business Scale and Operations
    numberOfFullTimeEmployees: new FormControl('', [Validators.required]),
    numberOfPartTimeEmployees: new FormControl(''),
    grossAnnualRevenue: new FormControl('', [Validators.required]),
    avgCustomersPerYear: new FormControl('', [Validators.required]),
    additionalBusinessInformation: new FormControl(''),

    // Tracking Email
    principalContactAgreement: new FormControl(false),
    submittedByName: new FormControl('', [Validators.required]),
    submittedByTitle: new FormControl('', [Validators.required]),
    submittedByEmail: new FormControl('', [Validators.required, Validators.email]),
  });

  ngOnInit() {
    // Initialize business types
    this.tobItems.set(this.staticBusinessTypes);
    this.allTobItems.set(this.staticBusinessTypes);
    this.secondaryTobItems.set(this.staticBusinessTypes);

    // Watch for changes in the "same as business address" checkbox
    this.accreditationForm.get('sameAsBusinessAddress')?.valueChanges.subscribe((isSame) => {
      if (isSame) {
        // Clear validators for mailing fields when checkbox is checked
        this.accreditationForm.get('mailingAddress')?.clearValidators();
        this.accreditationForm.get('mailingCity')?.clearValidators();
        this.accreditationForm.get('mailingState')?.clearValidators();
        this.accreditationForm.get('mailingZip')?.clearValidators();
      } else {
        // Clear mailing address fields when unchecked
        this.accreditationForm.patchValue({
          mailingAddress: '',
          mailingAptSuite: '',
          mailingCity: '',
          mailingState: '',
          mailingZip: '',
        });

        // Add validators back when checkbox is unchecked
        this.accreditationForm.get('mailingAddress')?.setValidators([Validators.required]);
        this.accreditationForm.get('mailingCity')?.setValidators([Validators.required]);
        this.accreditationForm.get('mailingState')?.setValidators([Validators.required]);
        this.accreditationForm.get('mailingZip')?.setValidators([Validators.required]);
      }

      // Update validation status
      this.accreditationForm.get('mailingAddress')?.updateValueAndValidity();
      this.accreditationForm.get('mailingCity')?.updateValueAndValidity();
      this.accreditationForm.get('mailingState')?.updateValueAndValidity();
      this.accreditationForm.get('mailingZip')?.updateValueAndValidity();
    });

    // Watch for changes in the "has multiple locations" checkbox
    this.accreditationForm.get('hasMultipleLocations')?.valueChanges.subscribe((hasMultiple) => {
      if (hasMultiple) {
        // Add validators when checkbox is checked
        this.accreditationForm.get('numberOfLocations')?.setValidators([Validators.required]);
      } else {
        // Clear field and validators when checkbox is unchecked
        this.accreditationForm.patchValue({
          numberOfLocations: '',
        });
        this.accreditationForm.get('numberOfLocations')?.clearValidators();
      }

      // Update validation status
      this.accreditationForm.get('numberOfLocations')?.updateValueAndValidity();
    });

    // Conditional validators for Secondary Contact: if any text field has a value,
    // make all secondary text fields required (excluding selects)
    this.setupSecondaryContactConditionalValidators();

    // Enforce uniqueness between primary and secondary email/phone
    this.accreditationForm.setValidators((control: AbstractControl): ValidationErrors | null =>
      this.uniquePrimarySecondaryValidator(control as FormGroup)
    );

    this.bindUniqueFieldRevalidation();

    // Keep agreement submitter fields in sync with primary contact when checkbox is checked
    this.setupPrincipalContactAutoFill();

    // Watch for businessType changes
    this.accreditationForm.get('businessType')?.valueChanges.subscribe((newPrimaryValue) => {
      if (!newPrimaryValue) {
        this.selectedSecondaryTobs.set([]);
        this.accreditationForm.get('secondaryBusinessTypes')?.setValue([]);
      } else {
        const currentSecondary = this.selectedSecondaryTobs();
        const updatedSecondary = currentSecondary.filter((item) => item.cbbbId !== newPrimaryValue);
        if (updatedSecondary.length !== currentSecondary.length) {
          this.selectedSecondaryTobs.set(updatedSecondary);
          this.accreditationForm
            .get('secondaryBusinessTypes')
            ?.setValue(updatedSecondary.map((item) => item.cbbbId));
        }

        const matchingTob = this.tobItems().find((tob) => tob.cbbbId === newPrimaryValue);
        if (matchingTob) {
          this.currentTob.set(matchingTob);
        }
      }
    });
  }

  // --- Conditional validators logic for Secondary Contact ---
  private setupSecondaryContactConditionalValidators(): void {
    const textFieldNames = [
      'secondaryFirstName',
      'secondaryLastName',
      'secondaryTitle',
      'secondaryEmail',
      'secondaryPhone',
    ];

    const updateValidators = () => {
      const anyFilled = textFieldNames.some((name) => {
        const value = (this.accreditationForm.get(name)?.value ?? '').toString().trim();
        return value.length > 0;
      });

      textFieldNames.forEach((name) => {
        const control = this.accreditationForm.get(name);
        if (!control) return;

        if (anyFilled) {
          if (name === 'secondaryEmail') {
            control.setValidators([Validators.required, Validators.email]);
          } else if (name === 'secondaryPhone') {
            control.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
          } else {
            control.setValidators([Validators.required]);
          }
          if (!control.touched) {
            control.markAsTouched({ onlySelf: true });
          }
          control.markAsDirty({ onlySelf: true });
        } else {
          if (name === 'secondaryEmail') {
            control.setValidators([Validators.email]);
          } else if (name === 'secondaryPhone') {
            control.setValidators([Validators.pattern(/^\d{10}$/)]);
          } else {
            control.clearValidators();
          }
          control.markAsPristine({ onlySelf: true });
          control.markAsUntouched({ onlySelf: true });
        }
        control.updateValueAndValidity({ emitEvent: false });
      });

      const secondaryPreferredCtrl = this.accreditationForm.get('secondaryPreferredContactMethod');
      if (secondaryPreferredCtrl) {
        if (anyFilled) {
          secondaryPreferredCtrl.setValidators([Validators.required]);
          if (!secondaryPreferredCtrl.touched) {
            secondaryPreferredCtrl.markAsTouched({ onlySelf: true });
          }
          secondaryPreferredCtrl.markAsDirty({ onlySelf: true });
        } else {
          secondaryPreferredCtrl.clearValidators();
          secondaryPreferredCtrl.markAsPristine({ onlySelf: true });
          secondaryPreferredCtrl.markAsUntouched({ onlySelf: true });
        }
        secondaryPreferredCtrl.updateValueAndValidity({ emitEvent: false });
      }
    };

    textFieldNames.forEach((name) => {
      this.accreditationForm.get(name)?.valueChanges.subscribe(updateValidators);
    });

    updateValidators();
  }

  // --- Primary vs Secondary uniqueness (email and phone) ---
  private uniquePrimarySecondaryValidator(group: FormGroup): ValidationErrors | null {
    const primaryEmail = (group.get('primaryContactEmail')?.value ?? '')
      .toString()
      .trim()
      .toLowerCase();
    const secondaryEmail = (group.get('secondaryEmail')?.value ?? '')
      .toString()
      .trim()
      .toLowerCase();
    const normalizePhone = (raw: any): string => {
      const digits = (raw ?? '').toString().replace(/\D+/g, '');
      return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    };

    const primaryPhone = normalizePhone(group.get('primaryContactNumber')?.value);
    const secondaryPhone = normalizePhone(group.get('secondaryPhone')?.value);

    const secondaryEmailControl = group.get('secondaryEmail');
    const secondaryPhoneControl = group.get('secondaryPhone');

    const setSpecificError = (ctrl: AbstractControl | null, key: string, hasError: boolean) => {
      if (!ctrl) return;
      const existing = ctrl.errors ?? {};
      if (hasError) {
        existing[key] = true;
        ctrl.setErrors(existing);
      } else {
        if (existing[key]) {
          delete existing[key];
          const newErrors = Object.keys(existing).length ? existing : null;
          ctrl.setErrors(newErrors);
        }
      }
    };

    const emailDuplicate = !!primaryEmail && !!secondaryEmail && primaryEmail === secondaryEmail;
    const phoneDuplicate = !!primaryPhone && !!secondaryPhone && primaryPhone === secondaryPhone;

    setSpecificError(secondaryEmailControl, 'duplicateWithPrimary', emailDuplicate);
    setSpecificError(secondaryPhoneControl, 'duplicateWithPrimary', phoneDuplicate);

    const groupHasError =
      emailDuplicate || phoneDuplicate ? { duplicatePrimarySecondary: true } : null;
    return groupHasError;
  }

  private bindUniqueFieldRevalidation(): void {
    const names = [
      'primaryContactEmail',
      'secondaryEmail',
      'primaryContactNumber',
      'secondaryPhone',
    ];
    names.forEach((name) => {
      this.accreditationForm.get(name)?.valueChanges.subscribe(() => {
        this.accreditationForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      });
    });
  }

  // --- Principal contact autofill logic ---
  private setupPrincipalContactAutoFill(): void {
    const principalCtrl = this.accreditationForm.get('principalContactAgreement');
    const nameCtrl = this.accreditationForm.get('submittedByName');
    const titleCtrl = this.accreditationForm.get('submittedByTitle');
    const emailCtrl = this.accreditationForm.get('submittedByEmail');

    const computeFullName = (): string => {
      const first = (this.accreditationForm.get('primaryFirstName')?.value ?? '').toString().trim();
      const last = (this.accreditationForm.get('primaryLastName')?.value ?? '').toString().trim();
      return [first, last].filter(Boolean).join(' ');
    };

    const syncFromPrimary = () => {
      if (!principalCtrl?.value) return;
      nameCtrl?.setValue(computeFullName(), { emitEvent: false });
      titleCtrl?.setValue(this.accreditationForm.get('primaryTitle')?.value ?? '', {
        emitEvent: false,
      });
      emailCtrl?.setValue(this.accreditationForm.get('primaryContactEmail')?.value ?? '', {
        emitEvent: false,
      });
    };

    const applyDisabledState = (checked: boolean) => {
      if (checked) {
        nameCtrl?.disable({ emitEvent: false });
        titleCtrl?.disable({ emitEvent: false });
        emailCtrl?.disable({ emitEvent: false });
        syncFromPrimary();
      } else {
        nameCtrl?.enable({ emitEvent: false });
        titleCtrl?.enable({ emitEvent: false });
        emailCtrl?.enable({ emitEvent: false });
        nameCtrl?.reset('', { emitEvent: false });
        titleCtrl?.reset('', { emitEvent: false });
        emailCtrl?.reset('', { emitEvent: false });
      }
    };

    principalCtrl?.valueChanges.subscribe((checked: boolean) => {
      applyDisabledState(checked);
    });

    ['primaryFirstName', 'primaryLastName', 'primaryTitle', 'primaryContactEmail'].forEach(
      (name) => {
        this.accreditationForm.get(name)?.valueChanges.subscribe(() => syncFromPrimary());
      }
    );

    applyDisabledState(!!principalCtrl?.value);
  }

  onSubmit(): void {
    if (this.accreditationForm.get('sameAsBusinessAddress')?.value) {
      this.accreditationForm.patchValue({
        mailingAddress: this.accreditationForm.get('businessAddress')?.value,
        mailingAptSuite: this.accreditationForm.get('businessAptSuite')?.value,
        mailingCity: this.accreditationForm.get('businessCity')?.value,
        mailingState: this.accreditationForm.get('businessState')?.value,
        mailingZip: this.accreditationForm.get('businessZip')?.value,
      });
    }
    if (this.accreditationForm.valid) {
      const formData = this.accreditationForm.getRawValue();
      console.log('Form submitted:', formData);
      toast.success('Form submitted successfully (no API call)');
    } else {
      this.accreditationForm.markAllAsTouched();
      toast.error('Please review the form and fix highlighted fields.');
    }
  }

  // Business type methods
  stateChanged(state: 'open' | 'closed') {
    this.state.set(state);
  }

  commandSelected(tob: TobItem) {
    this.state.set('closed');
    if (this.currentTob()?.cbbbId === tob.cbbbId) {
      this.currentTob.set(undefined);
      this.accreditationForm.get('businessType')?.setValue('');
      this.selectedSecondaryTobs.set([]);
      this.accreditationForm.get('secondaryBusinessTypes')?.setValue([]);
    } else {
      this.accreditationForm.get('businessType')?.setValue(tob.cbbbId);
      this.currentTob.set(tob);

      const currentSecondary = this.selectedSecondaryTobs();
      const updatedSecondary = currentSecondary.filter((item) => item.cbbbId !== tob.cbbbId);
      if (updatedSecondary.length !== currentSecondary.length) {
        this.selectedSecondaryTobs.set(updatedSecondary);
        this.accreditationForm
          .get('secondaryBusinessTypes')
          ?.setValue(updatedSecondary.map((item) => item.cbbbId));
      }
    }
  }

  commandSearch(value: string) {
    const searchTerm = value.toLowerCase().trim();
    if (!searchTerm) {
      this.tobItems.set(this.staticBusinessTypes);
    } else {
      const filtered = this.staticBusinessTypes.filter((tob) =>
        tob.name.toLowerCase().includes(searchTerm)
      );
      this.tobItems.set(filtered);
    }
  }

  // Secondary business types methods
  secondaryStateChanged(state: 'open' | 'closed') {
    this.secondaryState.set(state);
    if (state === 'open') {
      this.secondaryTobItems.set(this.allTobItems());
      this.secondarySearchValue.set('');
    }
  }

  secondaryCommandSelected(tob: TobItem) {
    const currentSelected = this.selectedSecondaryTobs();
    const isSelected = currentSelected.some((item) => item.cbbbId === tob.cbbbId);

    if (isSelected) {
      const updated = currentSelected.filter((item) => item.cbbbId !== tob.cbbbId);
      this.selectedSecondaryTobs.set(updated);
      this.accreditationForm
        .get('secondaryBusinessTypes')
        ?.setValue(updated.map((item) => item.cbbbId));
    } else {
      const updated = [...currentSelected, tob];
      this.selectedSecondaryTobs.set(updated);
      this.accreditationForm
        .get('secondaryBusinessTypes')
        ?.setValue(updated.map((item) => item.cbbbId));
    }
  }

  secondaryCommandSearch(value: string) {
    this.secondarySearchValue.set(value);
    const searchTerm = value.toLowerCase().trim();
    if (!searchTerm) {
      this.secondaryTobItems.set(this.allTobItems());
    } else {
      const filtered = this.allTobItems().filter((tob) =>
        tob.name.toLowerCase().includes(searchTerm)
      );
      this.secondaryTobItems.set(filtered);
    }
  }

  isSecondaryTobSelected(cbbbId: string): boolean {
    return this.selectedSecondaryTobs().some((item) => item.cbbbId === cbbbId);
  }

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

  removeSecondaryTob(tobToRemove: TobItem) {
    const updated = this.selectedSecondaryTobs().filter((tob) => tob.cbbbId !== tobToRemove.cbbbId);
    this.selectedSecondaryTobs.set(updated);
    this.accreditationForm
      .get('secondaryBusinessTypes')
      ?.setValue(updated.map((item) => item.cbbbId));
  }

  isBusinessTypeSelected(): boolean {
    return !!this.accreditationForm.get('businessType')?.value;
  }

  getBusinessTypeTriggerWidth(): number {
    return this.businessTypeTrigger?.nativeElement?.offsetWidth || 300;
  }

  getSecondaryBusinessTypeTriggerWidth(): number {
    return this.secondaryBusinessTypeTrigger?.nativeElement?.offsetWidth || 300;
  }

  getSecondaryTobItems(): TobItem[] {
    const primaryCbbbId = this.accreditationForm.get('businessType')?.value;
    const items = this.secondaryTobItems();
    if (!primaryCbbbId) {
      return items;
    }
    return items.filter((tob) => tob.cbbbId !== primaryCbbbId);
  }

  // Social Media Links methods
  get socialMediaLinks(): FormArray {
    return this.accreditationForm.get('socialMediaLinks') as FormArray;
  }

  addSocialMediaLink(): void {
    const socialMediaLink = new FormControl('', [Validators.required]);
    this.socialMediaLinks.push(socialMediaLink);
  }

  removeSocialMediaLink(index: number): void {
    this.socialMediaLinks.removeAt(index);
  }

  // Licenses methods
  get licenses(): FormArray {
    return this.accreditationForm.get('licenses') as FormArray;
  }

  addLicense(): void {
    const licenseGroup = new FormGroup({
      licensingNumber: new FormControl('', [Validators.required]),
      agency: new FormControl('', [Validators.required]),
      dateIssued: new FormControl(null, [Validators.required]),
      expiration: new FormControl(null),
    });
    this.licenses.push(licenseGroup);
  }

  removeLicense(index: number): void {
    this.licenses.removeAt(index);
  }
}
