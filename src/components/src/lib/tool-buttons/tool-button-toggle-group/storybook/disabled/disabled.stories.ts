import { Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

export default ToolButtonToggleGroupStoriesConstants.moduleDefinition;

export const disabled: Story = () => ({
  template: `
    <mat-button-toggle-group class="sg-tool-button-toggle-group">
      ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      <mat-button-toggle disabled data-test="select-table-button-toggle">
        <mat-icon>select_table</mat-icon>
      </mat-button-toggle>
    </mat-button-toggle-group>`
});
