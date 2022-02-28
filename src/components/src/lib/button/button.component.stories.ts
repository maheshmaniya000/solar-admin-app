import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Components/Button',
  decorators: [
    moduleMetadata({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        SgDefaultsModule
      ]
    })
  ]
};

export const all: Story = () => ({
  template: `
    <div class="container">
      <span class="label">Primary button</span>
      <button class="sg-small-button" mat-flat-button color="accent">
        small
      </button>
      <button mat-flat-button color="accent">
        medium
      </button>
      <button class="sg-large-button" mat-flat-button color="accent">
        large
      </button>
      <button disabled mat-flat-button color="accent">
        disabled
      </button>
      <button mat-flat-button color="accent">
        <mat-icon>add_circle_outline</mat-icon>
        With icon (LTR)
      </button>
      <mat-divider></mat-divider>

      <span class="label">Secondary button</span>
      <button class="sg-small-button" mat-stroked-button color="accent">
        small
      </button>
      <button mat-stroked-button color="accent">
        medium
      </button>
      <button class="sg-large-button" mat-stroked-button color="accent">
        large
      </button>
      <button disabled mat-stroked-button color="accent">
        disabled
      </button>
      <button mat-stroked-button color="accent">
        <mat-icon>add_circle_outline</mat-icon>
        With icon (LTR)
      </button>
      <mat-divider></mat-divider>

      <span class="label">Basic button</span>
      <button mat-button color="accent">
        One size
      </button>
      <div class="grid-column-start-5">
        <button disabled mat-button color="accent">
          Disabled
        </button>
      </div>
      <button mat-button color="accent">
        With icon (LTR)
        <mat-icon>calendar_today_16px</mat-icon>
      </button>
      <mat-divider></mat-divider>

      <span class="label">Icon button</span>
      <button mat-icon-button color="primary">
        <mat-icon>add_circle_outline</mat-icon>
      </button>
      <div class="grid-column-start-5">
        <button disabled mat-icon-button color="primary">
          <mat-icon>add_circle_outline</mat-icon>
        </button>
      </div>
    `,
  styles: [
    `
    .container {
      display: grid;
      width: 1000px;
      grid-template-columns: repeat(7, auto);
      grid-template-rows: repeat(4, auto);
      grid-gap: 5px;
      justify-items: center;
    }

    mat-divider {
      grid-column: span 7;
    }

    .label {
      align-self: center;
    }

    .grid-column-start-5 {
      grid-column-start: 5;
    }
    `
  ]
});
