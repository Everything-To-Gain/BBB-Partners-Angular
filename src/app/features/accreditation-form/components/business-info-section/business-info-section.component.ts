import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmError, HlmFormField, HlmHint } from '@spartan-ng/helm/form-field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'app-business-info-section',
  imports: [
    ReactiveFormsModule,
    HlmFormField,
    HlmInput,
    HlmError,
    HlmLabel,
    HlmCheckbox,
    ...HlmCardImports,
    HlmHint,
    BrnSelectImports,
    HlmSelectImports,
  ],
  templateUrl: './business-info-section.component.html',
})
export class BusinessInfoSectionComponent {
  form = input.required<FormGroup>();
  partnerName = input<string>('Partner');
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
}
