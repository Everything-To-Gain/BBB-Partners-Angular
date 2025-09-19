import { Component, input, output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmError, HlmFormField } from '@spartan-ng/helm/form-field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmDatePicker } from '@spartan-ng/helm/date-picker';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { provideIcons } from '@ng-icons/core';

@Component({
  selector: 'app-contact-info-section',
  imports: [
    ReactiveFormsModule,
    HlmFormField,
    HlmInput,
    HlmError,
    HlmLabel,
    HlmCardImports,
    HlmDatePicker,
    BrnSelectImports,
    HlmSelectImports,
    HlmButton,
    NgIcon,
    HlmIcon,
  ],
  providers: [provideIcons({ lucidePlus, lucideTrash2 })],

  templateUrl: './contact-info-section.component.html',
})
export class ContactInfoSectionComponent {
  form = input.required<FormGroup>();
  minDate = new Date();

  get socialMediaLinks(): FormArray {
    return this.form().get('socialMediaLinks') as FormArray;
  }

  // Output events for social media links
  addSocialMediaLink = output<void>();
  removeSocialMediaLink = output<number>();

  // Icons
  plusIcon = lucidePlus;
  trashIcon = lucideTrash2;
}
