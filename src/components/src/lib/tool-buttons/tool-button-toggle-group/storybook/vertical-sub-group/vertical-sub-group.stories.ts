import { Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

export default ToolButtonToggleGroupStoriesConstants.moduleDefinition;

export const verticalSubGroup: Story = () => ({
  template: `
    <mat-button-toggle-group vertical class="sg-tool-button-toggle-group">
      ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      ${ToolButtonToggleGroupStoriesConstants.buttonTogglesSubGroupTemplate}
    </mat-button-toggle-group>`
});
