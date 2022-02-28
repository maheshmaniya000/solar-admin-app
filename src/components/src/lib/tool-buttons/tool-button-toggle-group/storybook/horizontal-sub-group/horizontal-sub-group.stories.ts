import { Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

export default ToolButtonToggleGroupStoriesConstants.moduleDefinition;

export const horizontalSubGroup: Story = () => ({
  template: `
    <mat-button-toggle-group class="sg-tool-button-toggle-group">
      ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      ${ToolButtonToggleGroupStoriesConstants.buttonTogglesSubGroupTemplate}
    </mat-button-toggle-group>`
});
