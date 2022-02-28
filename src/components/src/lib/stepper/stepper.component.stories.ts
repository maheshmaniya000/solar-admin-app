import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { FormErrorModule } from '../form-error/form-error.module';
import { FormFieldModule } from '../form-field/form-field.module';
import { StepperModule } from './stepper.module';

const styles = [
  `
    button + button {
      margin-left: 10px;
    }
  `
];
const fourStepConfigs = [
  { label: 'First step label', content: 'First step content' },
  { label: 'Second step label', content: 'Second step content' },
  { label: 'Third step label', content: 'Third step content' },
  { label: 'Fourth step label', content: 'Fourth step content' }
];
const doneStep = `
  <mat-step>
    <ng-template matStepLabel>Done</ng-template>
    Done
    <div class="actions">
      <button
        class="sg-large-button"
        mat-stroked-button
        color="accent"
        matStepperPrevious
      >
        Previous
      </button>
      <span class="spacer"></span>
      <button
        class="sg-large-button"
        mat-flat-button
        color="accent"
      >
        Complete
      </button>
    </div>
  </mat-step>
`;

const createSimpleStep = (label: string, content: string): string => `
  <mat-step>
    <ng-template matStepLabel>${label}</ng-template>
    ${content}
    <div class="actions">
      <button
        class="sg-large-button"
        mat-stroked-button
        color="accent"
        matStepperPrevious
      >
        Previous
      </button>
      <span class="spacer"></span>
      <button
        class="sg-large-button"
        mat-flat-button
        color="accent"
        matStepperNext
      >
        Next
      </button>
    </div>
  </mat-step>
`;

@Component({
  selector: 'sg-optional-step-story',
  template: `
    <mat-horizontal-stepper linear class="no-header">
      <mat-step [stepControl]="firstFormGroup">
        <p>
          This step is mandatory, user can proceed only if the state of the form
          is valid.
        </p>
        <form [formGroup]="firstFormGroup">
          <mat-form-field>
            <mat-label>Name</mat-label>
            <input
              matInput
              placeholder="Last name, First name"
              formControlName="firstCtrl"
            />
          </mat-form-field>
          <div class="actions">
            <span class="spacer"></span>
            <button
              class="sg-large-button"
              mat-flat-button
              color="accent"
              matStepperNext
              type="button"
            >
              Next
            </button>
          </div>
        </form>
      </mat-step>
      <mat-step [stepControl]="secondFormGroup" [optional]="optional">
        <p>
          This step can be optional, user can proceed even if the state of the
          form is invalid. The form field includes max length validation for 5
          characters.
        </p>
        <form [formGroup]="secondFormGroup">
          <mat-form-field>
            <mat-label>Address</mat-label>
            <input
              matInput
              formControlName="secondCtrl"
              placeholder="Ex. 1 Main St, New York, NY"
            />
          </mat-form-field>
          <div class="actions">
            <button
              class="sg-large-button"
              mat-stroked-button
              color="accent"
              matStepperPrevious
            >
              Previous
            </button>
            <span class="spacer"></span>
            <button
              type="submit"
              class="sg-large-button"
              mat-flat-button
              color="accent"
              matStepperNext
            >
              Next
            </button>
          </div>
        </form>
      </mat-step>
      ${doneStep}
    </mat-horizontal-stepper>
  `,
  styles
})
class OptionalStepStoryComponent {
  @Input() optional: boolean;
  readonly fb = new FormBuilder();
  readonly firstFormGroup = this.fb.group({
    firstCtrl: [undefined, [Validators.required]]
  });
  readonly secondFormGroup = this.fb.group({
    secondCtrl: [undefined, [Validators.maxLength(5)]]
  });
}

const imports = [
  SgDefaultsModule,
  MatButtonModule,
  MatInputModule,
  ReactiveFormsModule,
  FormFieldModule,
  FormErrorModule,
  MatIconModule,
  StepperModule
];

@NgModule({
  declarations: [OptionalStepStoryComponent],
  imports,
  exports: [OptionalStepStoryComponent]
})
class OptionalStepStoryModule {}

export default {
  title: 'Solargis/Components/Stepper',
  decorators: [
    moduleMetadata({
      imports: [
        ...imports,
        BrowserAnimationsModule,
        CommonModule,
        OptionalStepStoryModule
      ]
    })
  ]
};

export const header: Story = props => ({
  props,
  template: `
    <mat-horizontal-stepper [class.no-header]="!headerDisplayed">
      ${fourStepConfigs.map(({ label, content }) =>
        createSimpleStep(label, content)
      )}
      ${doneStep}
    </mat-horizontal-stepper>
  `,
  styles
});

header.argTypes = {
  headerDisplayed: {
    name: 'Header displayed',
    control: { type: 'boolean' },
    defaultValue: true
  }
};

export const dynamicSteps: Story = props => ({
  props,
  template: `
    <mat-horizontal-stepper>
      ${fourStepConfigs.map(({ label, content }) =>
        createSimpleStep(label, content)
      )}
      <ng-container *ngIf="dynamicStepAdded">
        ${createSimpleStep('Dynamic step label', 'Dynamic step content')}
      </ng-container>
      ${doneStep}
    </mat-horizontal-stepper>
  `,
  styles
});

dynamicSteps.argTypes = {
  dynamicStepAdded: {
    name: 'Dynamic step',
    control: { type: 'boolean' },
    defaultValue: false
  }
};

export const optionalStep: Story = props => ({
  props,
  template: `
    <sg-optional-step-story [optional]="optional"></sg-optional-step-story>
  `
});

optionalStep.argTypes = {
  optional: {
    name: 'Optional',
    control: { type: 'boolean' },
    defaultValue: false
  }
};
