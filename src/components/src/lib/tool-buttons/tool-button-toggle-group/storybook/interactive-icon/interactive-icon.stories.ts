import { Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

export default ToolButtonToggleGroupStoriesConstants.moduleDefinition;

export const interactiveIcon: Story = props => ({
  props,
  templateUrl: 'interactive-icon.html',
  styleUrls: ['interactive-icon.scss']
});

interactiveIcon.argTypes = {
  smallIcon: {
    name: 'Small icon',
    control: { type: 'text' },
    defaultValue: 'inverter_16px'
  },
  largeIcon: {
    name: 'Large icon',
    control: { type: 'text' },
    defaultValue: 'select_table'
  }
};
