import { MatDividerModule } from '@angular/material/divider';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Components/Divider',
  decorators: [
    moduleMetadata({
      imports: [SgDefaultsModule, MatDividerModule]
    })
  ]
};

const containerStyles = `
    .container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
`;

export const horizontal: Story = () => ({
  template: `
    <div class="container">
      <mat-divider></mat-divider>
    </div>
  `,
  styles: [
    containerStyles,
    `
    mat-divider {
      width: 100%;
    }
  `
  ]
});

export const vertical: Story = () => ({
  template: `
    <div class="container">
      <mat-divider vertical></mat-divider>
    </div>
  `,
  styles: [
    containerStyles,
    `
    mat-divider {
      height: 100%;
    }
  `
  ]
});
