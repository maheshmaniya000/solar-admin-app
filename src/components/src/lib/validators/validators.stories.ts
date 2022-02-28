import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { moduleMetadata, Story } from '@storybook/angular';

import { TranslocoRootModule } from 'ng-shared/core/transloco-root.module';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { FormErrorModule } from '../form-error/form-error.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { SgValidators } from './validators';

export default {
  title: 'Solargis/Components/Validators',
  decorators: [
    moduleMetadata({
      imports: [
        MatInputModule,
        ReactiveFormsModule,
        FormFieldModule,
        SgDefaultsModule,
        HttpClientModule,
        TranslocoRootModule,
        FormErrorModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: '.' }]
    })
  ]
};

export const phoneNumberValidator: Story = () => ({
  props: {
    formControl: new FormControl(undefined, { validators: SgValidators.phoneNumber })
  },
  template: '<mat-form-field> <input matInput [formControl]="formControl" /> </mat-form-field>'
});
