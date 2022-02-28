import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { PasswordVisibilityToggleModule } from './password-visibility-toggle.module';

export default {
  title: 'Solargis/Components/Password Visibility Toggle',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        SgDefaultsModule,
        FormFieldModule,
        MatInputModule,
        PasswordVisibilityToggleModule
      ]
    })
  ]
};

export const basic: Story = props => ({
  props,
  template: `
    <mat-form-field>
      <input matInput type="password"/>
      <sg-password-visibility-toggle matSuffix>
      </sg-password-visibility-toggle>
    </mat-form-field>
  `
});
