import { CommonModule } from '@angular/common';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Components/Horizontal UL',
  decorators: [
    moduleMetadata({
      imports: [CommonModule, SgDefaultsModule]
    })
  ]
};

const items = [
  'Azimuth: 180°',
  'Tilt: 36°',
  'Row spacing: 2.50',
  'Ground coverage ratio: 40%',
  'Geometry'
];

const template = `
    <div class="sg-horizontal-ul-creator">
      <ul>
        <li *ngFor="let item of items">{{item}}</li>
      </ul>
    </div>
`;

export const basic: Story = () => ({
  props: {
    items
  },
  template
});

export const limitedWidth: Story = () => ({
  props: {
    items
  },
  template,
  styles: [
    `
    .sg-horizontal-ul-creator {
      width: 300px;
    }
  `
  ]
});
