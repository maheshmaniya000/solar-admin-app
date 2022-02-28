import { Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

export default ToolButtonToggleGroupStoriesConstants.moduleDefinition;

export const medium: Story = () => ({
  template: `
    <mat-button-toggle-group class="sg-tool-button-toggle-group medium">
      ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
    </mat-button-toggle-group>`
});
