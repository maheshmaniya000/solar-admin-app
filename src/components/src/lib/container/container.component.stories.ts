import { MatDividerModule } from '@angular/material/divider';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from 'components/defaults/defaults.module';


export default {
  title: 'Solargis/Layout/Container',
  decorators: [
    moduleMetadata({
      imports: [SgDefaultsModule, MatDividerModule]
    })
  ]
};

const template = `
  <div class="sg-container">
    <div class="content">
      <p>lorem ipsum text</p>
      <mat-divider class="wide"></mat-divider>
      <p>lorem ipsum text</p>
    </div>
  </div>
`;

const styles = [
  `
    .sg-container {
      background-color: powderblue;
    }

    .content {
      background-color: pink;
    }
  `
];

export const container: Story = () => ({
  template,
  styles
});
