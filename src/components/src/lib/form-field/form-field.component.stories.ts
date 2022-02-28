import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { TranslocoRootModule } from 'ng-shared/core/transloco-root.module';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { FormErrorModule } from '../form-error/form-error.module';
import { FormFieldModule } from './form-field.module';

export default {
  title: 'Solargis/Components/Form Field',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        MatInputModule,
        SgDefaultsModule,
        FormFieldModule,
        FormsModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        HttpClientModule,
        TranslocoRootModule,
        FormErrorModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: '.' }]
    })
  ]
};

export const bottomSpacing: Story = props => ({
  props,
  template: `
    <div class="container">
      <label for="input1">Hint</label>
      <div>
        <mat-form-field>
          <input id="input1" matInput placeholder="placeholder">
          <mat-hint *ngIf="hintVisible">Some hint</mat-hint>
        </mat-form-field>
        <div>Some block to demonstrate form field height without hint.</div>
      </div>

      <label for="input2">Error</label>
      <div>
        <mat-form-field>
          <input id="input2" matInput placeholder="placeholder" ngModel required>
        </mat-form-field>
        <div>
          Some block to demonstrate form field height with dynamic error. Since
          this field is required, you can see its error when its value is empty,
          and you interact with the input at least once (click in and out).
        </div>
      </div>

      <label for="input3">Error + hint</label>
      <div>
        <mat-form-field>
          <input id="input3" matInput placeholder="placeholder" ngModel required>
          <mat-hint *ngIf="hintVisible">Some hint</mat-hint>
        </mat-form-field>
        <div>
          Some block to demonstrate form field height with dynamic error & hint. Since
          this field is required, you can see its error when its value is empty,
          and you interact with the input at least once (click in and out).
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 10px;
      width: 800px;
    }
  `
  ]
});

bottomSpacing.argTypes = {
  hintVisible: {
    name: 'Hint visible',
    control: { type: 'boolean' },
    defaultValue: false
  }
};

export const disabled: Story = props => ({
  props,
  template: `
    <div class="container">
      <p>
        'Required' error message will be rendered only if this input is touched
         and enabled. To demonstrate that disabled inputs do not display error, first
         interact with it (click in and out) and then set the disabled control to
         'True'.
      </p>
      <mat-form-field>
        <input matInput ngModel [disabled]="disabled" required placeholder="placeholder"/>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
    .container {
      width: 500px;
    }
  `
  ]
});

disabled.argTypes = {
  disabled: {
    name: 'Disabled',
    control: { type: 'boolean' },
    defaultValue: false
  }
};

export const prefixAndSuffix: Story = () => ({
  template: `
    <div class="container">
      <label for="input1">Text</label>
      <mat-form-field>
        <input id="input1" matInput placeholder="placeholder"/>
        <span matPrefix>+421</span>
        <span matSuffix>kWh</span>
      </mat-form-field>
      <label for="input2">Icon / Icon button</label>
      <mat-form-field>
        <input id="input2" matInput placeholder="placeholder"/>
        <mat-icon matPrefix>search</mat-icon>
        <button mat-icon-button color="primary" matSuffix>
          <mat-icon>visibility_off</mat-icon>
        </button>
      </mat-form-field>
    </div>
  `,
  styles: [
    `
    .container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 10px;
      width: 500px;
    }
  `
  ]
});
