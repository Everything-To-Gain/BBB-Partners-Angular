import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmProgress, HlmProgressIndicator } from '@spartan-ng/helm/progress';
import {
  lucideBuilding,
  lucideUsers,
  lucideFileText,
  lucideAward,
  lucideCircleCheck,
  lucideLoader,
} from '@ng-icons/lucide';
import { HlmCard } from '@spartan-ng/helm/card';
import {
  FormGroup,
  FormControl,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { BusinessInfoSectionComponent } from '../components/business-info-section/business-info-section.component';
import { ContactInfoSectionComponent } from '../components/contact-info-section/contact-info-section.component';
import { BusinessDetailsSectionComponent } from '../components/business-details-section/business-details-section.component';
import { AgreementSectionComponent } from '../components/agreement-section/agreement-section.component';
import { HlmButton } from '@spartan-ng/helm/button';
import { toast } from 'ngx-sonner';
import { AccreditationFormService } from '../services/accreditation-form.service';

@Component({
  selector: 'app-accreditation-form',
  imports: [
    ReactiveFormsModule,
    HlmProgress,
    HlmProgressIndicator,
    NgIcon,
    HlmIcon,
    HlmCard,
    HlmButton,
    BusinessInfoSectionComponent,
    ContactInfoSectionComponent,
    BusinessDetailsSectionComponent,
    AgreementSectionComponent,
  ],
  providers: [
    provideIcons({
      lucideBuilding,
      lucideUsers,
      lucideFileText,
      lucideAward,
      lucideCircleCheck,
      lucideLoader,
    }),
  ],
  templateUrl: './accreditation-form.component.html',
})
export class AccreditationFormComponent implements OnInit {
  private accreditationFormService = inject(AccreditationFormService);
  progress = signal(25);
  currentStep = signal(1);
  isSubmitting = signal(false);
  steps = [
    { id: 1, title: 'Business Information', icon: 'lucideBuilding' },
    { id: 2, title: 'Contact Information', icon: 'lucideUsers' },
    { id: 3, title: 'Business Details', icon: 'lucideFileText' },
    { id: 4, title: 'Agreement', icon: 'lucideAward' },
  ];

  // Field mapping to steps
  private fieldToStepMap: { [key: string]: number } = {
    // Step 1: Business Information
    businessName: 1,
    doingBusinessAs: 1,
    businessAddress: 1,
    businessAptSuite: 1,
    businessState: 1,
    businessCity: 1,
    businessZip: 1,
    sameAsBusinessAddress: 1,
    mailingAddress: 1,
    mailingAptSuite: 1,
    mailingCity: 1,
    mailingState: 1,
    mailingZip: 1,
    hasMultipleLocations: 1,
    numberOfLocations: 1,

    // Step 2: Business Contact Information
    primaryBusinessPhone: 2,
    primaryBusinessEmail: 2,
    emailToReceiveQuoteRequestsFromCustomers: 2,
    website: 2,
    socialMediaLinks: 2,

    // Step 2: Primary Contact Information
    primaryFirstName: 2,
    primaryLastName: 2,
    primaryTitle: 2,
    primaryDateOfBirth: 2,
    primaryContactEmail: 2,
    primaryContactNumber: 2,
    preferredContactMethod: 2,
    primaryContactTypes: 2,

    // Step 2: Secondary Contact Information
    secondaryFirstName: 2,
    secondaryLastName: 2,
    secondaryTitle: 2,
    secondaryEmail: 2,
    secondaryPhone: 2,
    secondaryContactTypes: 2,
    secondaryPreferredContactMethod: 2,
    // Step 3: Business Details and Licensing
    businessDescription: 3,
    businessServiceArea: 3,
    ein: 3,
    businessType: 3,
    businessEntityType: 3,
    businessStartDate: 3,
    // Step 3: Licensing and certifications
    licenses: 3,

    // Step 3: Business Scale and Operations
    numberOfFullTimeEmployees: 3,
    numberOfPartTimeEmployees: 3,
    grossAnnualRevenue: 3,
    avgCustomersPerYear: 3,
    additionalBusinessInformation: 3,

    // Step 4: Tracking Email and Agreement
    principalContactAgreement: 4,
    agreement: 4,
    submittedByName: 4,
    submittedByTitle: 4,
    submittedByEmail: 4,
  };

  // Human-friendly labels for fields used in toasts and messages
  private fieldLabels: { [key: string]: string } = {
    businessName: 'Business Name',
    doingBusinessAs: 'Doing Business As',
    businessAddress: 'Business Address',
    businessAptSuite: 'Business Apt/Suite Number',
    businessState: 'Business State',
    businessCity: 'Business City',
    businessZip: 'Business ZIP Code',
    sameAsBusinessAddress: 'Same as Business Address',
    mailingAddress: 'Mailing Address',
    mailingAptSuite: 'Mailing Apt/Suite Number',
    mailingCity: 'Mailing City',
    mailingState: 'Mailing State',
    mailingZip: 'Mailing ZIP Code',
    hasMultipleLocations: 'Has Multiple Locations',
    numberOfLocations: 'Number of Locations',
    primaryBusinessPhone: 'Primary Business Phone',
    primaryBusinessEmail: 'Primary Business Email',
    emailToReceiveQuoteRequestsFromCustomers: 'Email to receive quote requests from customers',
    website: 'Website',
    socialMediaLinks: 'Social Media Links',
    primaryFirstName: 'Primary First Name',
    primaryLastName: 'Primary Last Name',
    primaryTitle: 'Primary Title',
    primaryDateOfBirth: 'Primary Date of Birth',
    primaryContactEmail: 'Primary Contact Email',
    primaryContactNumber: 'Primary Contact Number',
    preferredContactMethod: 'Preferred Contact Method',
    primaryContactTypes: 'Primary Contact Types',
    secondaryFirstName: 'Secondary First Name',
    secondaryLastName: 'Secondary Last Name',
    secondaryTitle: 'Secondary Title',
    secondaryEmail: 'Secondary Email',
    secondaryPhone: 'Secondary Phone',
    secondaryContactTypes: 'Secondary Contact Types',
    secondaryPreferredContactMethod: 'Secondary Preferred Contact Method',
    businessDescription: 'Business Description',
    businessServiceArea: 'Business Service Area',
    ein: 'EIN',
    businessType: 'Type of Business',
    businessEntityType: 'Business Entity Type',
    businessStartDate: 'Business Start Date',
    licenses: 'Licenses',
    numberOfFullTimeEmployees: 'Number of Full Time Employees',
    numberOfPartTimeEmployees: 'Number of Part Time Employees',
    grossAnnualRevenue: 'Gross Annual Revenue',
    avgCustomersPerYear: 'Average Customers Per Year',
    additionalBusinessInformation: 'Additional Business Information',
    principalContactAgreement: 'Principal Contact Agreement',
    submittedByName: 'Submitted By Name',
    submittedByTitle: 'Submitted By Title',
    submittedByEmail: 'Submitted By Email',
    agreement: 'Agreement',
  };

  private getStepTitle(step: number): string {
    const match = this.steps.find((s) => s.id === step);
    return match ? match.title : `Step ${step}`;
  }

  ngOnInit() {
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
  }

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
    primaryBusinessPhone: new FormControl('', [Validators.required]),
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
    primaryContactNumber: new FormControl('', [Validators.required]),
    preferredContactMethod: new FormControl(''),
    primaryContactTypes: new FormControl([]),

    // Secondary Contact Information
    secondaryFirstName: new FormControl(''),
    secondaryLastName: new FormControl(''),
    secondaryTitle: new FormControl(''),
    secondaryEmail: new FormControl(''),
    secondaryContactTypes: new FormControl([]),
    secondaryPhone: new FormControl(''),
    secondaryPreferredContactMethod: new FormControl(''),

    // Business Details and Licensing
    businessDescription: new FormControl('', [Validators.required]),
    businessServiceArea: new FormControl('', [Validators.required]),
    ein: new FormControl(''),
    businessType: new FormControl('', [Validators.required]),
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
    principalContactAgreement: new FormControl(false, [Validators.required]),
    agreement: new FormControl(false, [Validators.required]),
    submittedByName: new FormControl('', [Validators.required]),
    submittedByTitle: new FormControl('', [Validators.required]),
    submittedByEmail: new FormControl('', [Validators.required, Validators.email]),
  });

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
          } else {
            control.setValidators([Validators.required]);
          }
        } else {
          // When none are filled, remove required constraints
          if (name === 'secondaryEmail') {
            control.setValidators([Validators.email]);
          } else {
            control.clearValidators();
          }
        }
        control.updateValueAndValidity({ emitEvent: false });
      });
    };

    // Subscribe to changes for each text field
    textFieldNames.forEach((name) => {
      this.accreditationForm.get(name)?.valueChanges.subscribe(updateValidators);
    });

    // Initialize once
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
      // Strip leading country code '1' if present to compare NANP numbers fairly
      return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
    };

    const primaryPhone = normalizePhone(group.get('primaryContactNumber')?.value);
    const secondaryPhone = normalizePhone(group.get('secondaryPhone')?.value);

    const secondaryEmailControl = group.get('secondaryEmail');
    const secondaryPhoneControl = group.get('secondaryPhone');

    // Helper to set/clear a specific error key without wiping others
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

    // Also reflect a group-level error for convenience
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
        // trigger group validator without emitting extra value change loops
        this.accreditationForm.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      });
    });
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
      // this.isSubmitting.set(true);
      console.log('Form submitted:', this.accreditationForm.value);
      // this.accreditationFormService
      //   .submitAccreditationForm(this.accreditationForm.value)
      //   .subscribe({
      //     next: (res) => {
      //       toast.success('Form submitted successfully');
      //       this.isSubmitting.set(false);
      //     },
      //     error: (error) => {
      //       toast.error('Failed to submit form. Please try again.');
      //       this.isSubmitting.set(false);
      //     },
      //   });
    } else {
      console.log('Invalid form submitted:', this.accreditationForm.value);
      this.accreditationForm.markAllAsTouched();
      const firstInvalid = this.getFirstInvalidField();
      if (firstInvalid) {
        const step = this.fieldToStepMap[firstInvalid];
        const label = this.fieldLabels[firstInvalid] ?? firstInvalid;
        const stepTitle = this.getStepTitle(step);
        toast.error(`Please complete "${label}" in ${stepTitle}.`);
        this.navigateToFirstInvalidField();
      } else {
        toast.error('Please review the form and fix highlighted fields.');
      }
    }
  }

  nextStep(): void {
    const current = this.currentStep();
    const invalidInStep = this.getInvalidFieldsForStep(current);

    if (invalidInStep.length > 0) {
      // Mark invalid fields as touched so errors show
      invalidInStep.forEach((name) => this.accreditationForm.get(name)?.markAsTouched());
      const first = invalidInStep[0];
      const label = this.fieldLabels[first] ?? first;
      const stepTitle = this.getStepTitle(current);
      toast.error(`Please complete "${label}" in ${stepTitle}.`);
      this.scrollToAndFocusField(first);
      return;
    }

    if (current < this.steps.length) {
      this.currentStep.update((value) => value + 1);
      this.progress.update((value) => value + 25);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((value) => value - 1);
      this.progress.update((value) => value - 25);
    }
  }

  private navigateToFirstInvalidField(): void {
    const firstInvalidField = this.getFirstInvalidField();
    if (firstInvalidField) {
      const stepNumber = this.fieldToStepMap[firstInvalidField];
      if (stepNumber && stepNumber !== this.currentStep()) {
        this.currentStep.set(stepNumber);
        this.progress.set(stepNumber * 25);

        // Scroll to the form and focus the invalid field
        setTimeout(() => {
          this.scrollToAndFocusField(firstInvalidField);
        }, 100);
      } else if (stepNumber === this.currentStep()) {
        // If we're already on the correct step, just focus the field
        setTimeout(() => {
          this.scrollToAndFocusField(firstInvalidField);
        }, 100);
      }
    }
  }

  private getFirstInvalidField(): string | null {
    const controls = this.accreditationForm.controls;

    // First, check for touched invalid fields
    for (const [fieldName, control] of Object.entries(controls)) {
      if (control.invalid && control.touched) {
        return fieldName;
      }
    }

    // If no touched invalid fields, find the first invalid field
    for (const [fieldName, control] of Object.entries(controls)) {
      if (control.invalid) {
        return fieldName;
      }
    }

    return null;
  }

  private scrollToAndFocusField(fieldName: string): void {
    // Try to find the input field by formControlName
    const inputElement = document.querySelector(
      `input[formControlName="${fieldName}"], textarea[formControlName="${fieldName}"], select[formControlName="${fieldName}"]`
    ) as HTMLElement;

    if (inputElement) {
      // Scroll to the field
      inputElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Focus the field after a short delay
      setTimeout(() => {
        inputElement.focus();
      }, 300);
    } else {
      // Fallback: scroll to the form
      const formElement = document.querySelector('form');
      if (formElement) {
        formElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }

  getStepClasses(stepId: number): string {
    const isCompleted = this.currentStep() > stepId;
    const isCurrent = this.currentStep() === stepId;

    let classes = 'flex flex-col items-center ';

    if (isCurrent) classes += 'text-primary';
    else if (isCompleted) classes += 'text-success';
    else classes += 'text-muted-foreground';
    return classes;
  }

  getStepIconClasses(stepId: number): string {
    const isCompleted = this.currentStep() > stepId;
    const isCurrent = this.currentStep() === stepId;

    let classes = 'rounded-full p-2 mb-2 flex items-center justify-center ';

    if (isCurrent) classes += 'bg-primary text-primary-foreground';
    else if (isCompleted) classes += 'bg-success text-success-foreground';
    else classes += 'bg-muted text-muted-foreground';
    return classes;
  }

  // Returns names of controls in a step that are currently invalid (any error)
  private getInvalidFieldsForStep(stepId: number): string[] {
    const result: string[] = [];
    const controls = this.accreditationForm.controls;
    for (const [fieldName, control] of Object.entries(controls)) {
      if (this.fieldToStepMap[fieldName] !== stepId) continue;
      control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      if (control.invalid) result.push(fieldName);
    }
    return result;
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
    console.log(this.accreditationForm.get('licenses'));
    this.licenses.push(licenseGroup);
  }

  removeLicense(index: number): void {
    this.licenses.removeAt(index);
  }
}
