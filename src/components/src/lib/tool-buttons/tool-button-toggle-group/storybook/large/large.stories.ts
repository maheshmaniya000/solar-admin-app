import { Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

export default ToolButtonToggleGroupStoriesConstants.moduleDefinition;

export const large: Story = () => ({
  template: `
    <mat-button-toggle-group class="sg-tool-button-toggle-group">
      ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
    </mat-button-toggle-group>`
});
