import { moduleMetadata, Story } from '@storybook/angular';

import { RangeIndicatorComponent } from './range-indicator.component';
import { RangeIndicatorModule } from './range-indicator.module';

const styles = [
  `
    .small {
      width: 100px;
      display: block;
      margin: 1em;
    }
    .big {
      width: 500px;
      height: 20px;
      display: block;
      margin: 1em;
    }
  `
];

export default {
  title: 'Solargis/Components/Range Indicator',
  component: RangeIndicatorComponent,
  decorators: [
    moduleMetadata({
      imports: [RangeIndicatorModule]
    })
  ]
};

const createTemplate = (styleClass: string): string => `
  <sg-range-indicator class="${styleClass}" [min]="0" [max]="100" [target]="80" [value]="50"></sg-range-indicator>
  <sg-range-indicator class="${styleClass}" [min]="0" [max]="100" [target]="80" [value]="90"></sg-range-indicator>
  <sg-range-indicator class="${styleClass}" [min]="0" [max]="100" [target]="80" [value]="80"></sg-range-indicator>
`;

export const small: Story = () => ({
  template: createTemplate('small'),
  styles
});

export const large: Story = () => ({
  template: createTemplate('big'),
  styles
});

export const interactive: Story = props => ({
  props,
  styles
});

interactive.argTypes = {
  min: {
    name: 'Minimum',
    control: { type: 'number' },
    defaultValue: 0
  },
  max: {
    name: 'Maximum',
    control: { type: 'number' },
    defaultValue: 100
  },
  value: {
    name: 'Value',
    control: { type: 'number' },
    defaultValue: 50
  },
  target: {
    name: 'Target',
    control: { type: 'number' },
    defaultValue: 80
  }
};
