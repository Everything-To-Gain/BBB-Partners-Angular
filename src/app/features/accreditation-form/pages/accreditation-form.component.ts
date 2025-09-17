import { Component, inject, signal } from '@angular/core';
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
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class AccreditationFormComponent {
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
    businessState: 1,
    businessCity: 1,
    businessZip: 1,
    mailingAddress: 1,

    // Step 2: Business Contact Information
    primaryBusinessPhone: 2,
    primaryBusinessEmail: 2,
    requestQuoteEmail: 2,
    website: 2,

    // Step 2: Primary Contact Information
    primaryFirstName: 2,
    primaryLastName: 2,
    primaryTitle: 2,
    primaryDateOfBirth: 2,
    primaryContactEmail: 2,
    primaryContactNumber: 2,
    preferredContactMethod: 2,
    primaryDelegationTasks: 2,

    // Step 2: Secondary Contact Information
    secondaryFirstName: 2,
    secondaryLastName: 2,
    secondaryEmail: 2,
    secondaryPhone: 2,

    // Step 3: Business Details and Licensing
    businessDescription: 3,
    ein: 3,
    ssn: 3,
    businessType: 3,
    incorporationDetails: 3,
    businessEntityType: 3,

    // Step 3: Licensing and certifications
    stateBusinessLicense: 3,
    professionalLicense: 3,

    // Step 3: Business Scale and Operations
    numberOfEmployees: 3,
    grossAnnualRevenue: 3,
    avgCustomersPerYear: 3,

    // Step 4: Tracking Email and Agreement
    trackingEmail: 4,
    agreement: 4,
  };

  // Human-friendly labels for fields used in toasts and messages
  private fieldLabels: { [key: string]: string } = {
    businessName: 'Business Name',
    doingBusinessAs: 'Doing Business As',
    businessAddress: 'Business Address',
    businessState: 'Business State',
    businessCity: 'Business City',
    businessZip: 'Business ZIP Code',
    mailingAddress: 'Mailing Address',
    primaryBusinessPhone: 'Primary Business Phone',
    primaryBusinessEmail: 'Primary Business Email',
    requestQuoteEmail: 'Request Quote Email',
    website: 'Website',
    primaryFirstName: 'Primary First Name',
    primaryLastName: 'Primary Last Name',
    primaryTitle: 'Primary Title',
    primaryDateOfBirth: 'Primary Date of Birth',
    primaryContactEmail: 'Primary Contact Email',
    primaryContactNumber: 'Primary Contact Number',
    preferredContactMethod: 'Preferred Contact Method',
    primaryDelegationTasks: 'Primary Delegation Tasks',
    secondaryFirstName: 'Secondary First Name',
    secondaryLastName: 'Secondary Last Name',
    secondaryEmail: 'Secondary Email',
    secondaryPhone: 'Secondary Phone',
    businessDescription: 'Business Description',
    ein: 'EIN',
    ssn: 'SSN',
    businessType: 'Type of Business',
    incorporationDetails: 'Incorporation Details',
    businessEntityType: 'Business Entity Type',
    stateBusinessLicense: 'State Business License',
    professionalLicense: 'Professional License',
    numberOfEmployees: 'Number of Employees',
    grossAnnualRevenue: 'Gross Annual Revenue',
    avgCustomersPerYear: 'Average Customers Per Year',
    trackingEmail: 'Tracking Email',
    agreement: 'Agreement',
  };

  private getStepTitle(step: number): string {
    const match = this.steps.find((s) => s.id === step);
    return match ? match.title : `Step ${step}`;
  }

  // Create the form with all fields using FormGroup and FormControl
  accreditationForm: FormGroup = new FormGroup({
    // Business Information
    businessName: new FormControl('', [Validators.required]),
    doingBusinessAs: new FormControl(''),
    businessAddress: new FormControl('', [Validators.required]),
    businessState: new FormControl('', [Validators.required]),
    businessCity: new FormControl('', [Validators.required]),
    businessZip: new FormControl('', [Validators.required]),
    mailingAddress: new FormControl('', [Validators.email]),

    // Business Contact Information
    primaryBusinessPhone: new FormControl('', [Validators.required]),
    primaryBusinessEmail: new FormControl('', [Validators.required, Validators.email]),
    requestQuoteEmail: new FormControl('', [Validators.email]),
    website: new FormControl('', [Validators.required]),

    // Primary Contact Information
    primaryFirstName: new FormControl('', [Validators.required]),
    primaryLastName: new FormControl('', [Validators.required]),
    primaryTitle: new FormControl(''),
    primaryDateOfBirth: new FormControl(null),
    primaryContactEmail: new FormControl('', [Validators.required, Validators.email]),
    primaryContactNumber: new FormControl('', [Validators.required]),
    preferredContactMethod: new FormControl([]),
    primaryDelegationTasks: new FormControl([]),

    // Secondary Contact Information
    secondaryFirstName: new FormControl(''),
    secondaryLastName: new FormControl(''),
    secondaryEmail: new FormControl('', [Validators.email]),
    secondaryPhone: new FormControl(''),

    // Business Details and Licensing
    businessDescription: new FormControl('', [Validators.required]),
    ein: new FormControl(''),
    ssn: new FormControl(''),
    businessType: new FormControl('', [Validators.required]),
    incorporationDetails: new FormControl(''),
    businessEntityType: new FormControl([], [Validators.required]),

    // Licensing and certifications
    stateBusinessLicense: new FormControl('', [Validators.required]),
    professionalLicense: new FormControl(''),

    // Business Scale and Operations
    numberOfEmployees: new FormControl('', [Validators.required]),
    grossAnnualRevenue: new FormControl('', [Validators.required]),
    avgCustomersPerYear: new FormControl('', [Validators.required]),

    // Tracking Email
    trackingEmail: new FormControl('', [Validators.required, Validators.email]),
    agreement: new FormControl(false, [Validators.required]),
  });

  onSubmit(): void {
    if (this.accreditationForm.valid) {
      this.isSubmitting.set(true);
      console.log('Form submitted:', this.accreditationForm.value);
      this.accreditationFormService
        .submitAccreditationForm(this.accreditationForm.value)
        .subscribe({
          next: (res) => {
            toast.success('Form submitted successfully');
            this.isSubmitting.set(false);
          },
          error: (error) => {
            toast.error('Failed to submit form. Please try again.');
            this.isSubmitting.set(false);
          },
        });
    } else {
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
    if (this.currentStep() < this.steps.length) {
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

  // Add this new method to get all invalid fields with their errors
  private getInvalidFields(): { [key: string]: any } {
    const invalidFields: { [key: string]: any } = {};
    const controls = this.accreditationForm.controls;

    for (const [fieldName, control] of Object.entries(controls)) {
      if (control.invalid) {
        invalidFields[fieldName] = {
          value: control.value,
          errors: control.errors,
          touched: control.touched,
          dirty: control.dirty,
          status: control.status,
        };
      }
    }

    return invalidFields;
  }
}
