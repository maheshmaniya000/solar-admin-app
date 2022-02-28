import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { RangeRiderMocks } from './mock/range-rider.mocks';
import { RangeRiderModule } from './range-rider.module';

export default {
  title: 'Solargis/Components/Range Rider',
  decorators: [
    moduleMetadata({
      imports: [RangeRiderModule, SgDefaultsModule]
    })
  ]
};

export const predefinedStopsArrays: Story = props => ({
  props,
  template:
    '<sg-range-rider [stops]="stops" [value]="value"></sg-range-rider><br><br>Array of stops: <pre>{{stops | json}}</pre>'
});

predefinedStopsArrays.argTypes = {
  value: { name: 'Value', control: { type: 'number' }, defaultValue: 5 },
  stops: {
    name: 'Stops',
    control: {
      type: 'select',
      options: {
        simple: RangeRiderMocks.simpleMockStops,
        'with interval of one color':
          RangeRiderMocks.mockStopsWithIntervalOfOneColor
      }
    },
    defaultValue: RangeRiderMocks.simpleMockStops
  }
};

export const configurableStopsArray: Story = props => ({
  props,
  template: '<sg-range-rider [stops]="stops" [value]="value"></sg-range-rider>'
});

configurableStopsArray.argTypes = {
  stops: {
    name: 'Stops',
    control: { type: 'object' },
    defaultValue: RangeRiderMocks.mockStopsWithIntervalOfOneColor
  },
  value: {
    name: 'Value',
    control: { type: 'number' },
    defaultValue: 18
  }
};
