import { Component, Input } from '@angular/core';
import { moduleMetadata, Story } from '@storybook/angular';

import { ToolButtonToggleGroupStoriesConstants } from '../tool-button-toggle-group-stories.constants';

@Component({
  selector: 'sg-side-attachments-story',
  template: `
    <div class="container">
      <mat-button-toggle-group
        class="sg-tool-button-toggle-group attached-to-top attached-to-start"
        [class.preserved-border]="preservedBorder"
      >
        ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      </mat-button-toggle-group>
      <mat-button-toggle-group
        class="sg-tool-button-toggle-group attached-to-top"
        [class.preserved-border]="preservedBorder"
      >
        ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      </mat-button-toggle-group>
      <mat-button-toggle-group
        class="sg-tool-button-toggle-group attached-to-top attached-to-end"
        [class.preserved-border]="preservedBorder"
      >
        ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      </mat-button-toggle-group>
      <mat-button-toggle-group
        class="sg-tool-button-toggle-group attached-to-bottom attached-to-start"
        [class.preserved-border]="preservedBorder"
      >
        ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      </mat-button-toggle-group>
      <mat-button-toggle-group
        class="sg-tool-button-toggle-group attached-to-bottom"
        [class.preserved-border]="preservedBorder"
      >
        ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      </mat-button-toggle-group>
      <mat-button-toggle-group
        class="sg-tool-button-toggle-group attached-to-bottom attached-to-end"
        [class.preserved-border]="preservedBorder"
      >
        ${ToolButtonToggleGroupStoriesConstants.largeIconsButtonTogglesTemplate}
      </mat-button-toggle-group>
    </div>
  `,
  styles: [
    `
      .container {
        height: 200px;
        background-color: #edeff1;
        display: grid;
        grid-template-columns: repeat(3, auto);
        grid-column-gap: 10px;
        align-content: space-between;
        justify-content: space-between;
      }
    `
  ]
})
class SideAttachmentsStoryComponent {
  @Input() preservedBorder = false;
}

export default {
  ...ToolButtonToggleGroupStoriesConstants.moduleDefinition,
  decorators: [
    ...ToolButtonToggleGroupStoriesConstants.moduleDefinition.decorators,
    moduleMetadata({ declarations: [SideAttachmentsStoryComponent] })
  ]
};

export const sideAttachments: Story = () => ({
  template: `
    <h2>No border:</h2>
    <sg-side-attachments-story></sg-side-attachments-story>
    <br>
    <h2>Preserved border:</h2>
    <sg-side-attachments-story [preservedBorder]="true"></sg-side-attachments-story>
  `
});
