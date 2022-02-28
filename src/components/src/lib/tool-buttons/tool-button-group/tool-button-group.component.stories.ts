import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../../defaults/defaults.module';

const mapToolButtonsTemplate = `
  <button mat-icon-button color="primary">
    <mat-icon>zoom_selected</mat-icon>
  </button>
  <button mat-icon-button color="primary">
    <mat-icon>zoom_all</mat-icon>
  </button>
  <button mat-icon-button color="primary">
    <mat-icon>gps_fixed</mat-icon>
  </button>
`;

@Component({
  selector: 'sg-side-attachments-story',
  template: `
    <div class="container">
      <div
        class="sg-tool-button-group attached-to-top attached-to-start"
        [class.preserved-border]="preservedBorder"
      >
        ${mapToolButtonsTemplate}
      </div>
      <div
        class="sg-tool-button-group attached-to-top"
        [class.preserved-border]="preservedBorder"
      >
        ${mapToolButtonsTemplate}
      </div>
      <div
        class="sg-tool-button-group attached-to-top attached-to-end"
        [class.preserved-border]="preservedBorder"
      >
        ${mapToolButtonsTemplate}
      </div>
      <div
        class="sg-tool-button-group attached-to-bottom attached-to-start"
        [class.preserved-border]="preservedBorder"
      >
        ${mapToolButtonsTemplate}
      </div>
      <div
        class="sg-tool-button-group attached-to-bottom"
        [class.preserved-border]="preservedBorder"
      >
        ${mapToolButtonsTemplate}
      </div>
      <div
        class="sg-tool-button-group attached-to-bottom attached-to-end"
        [class.preserved-border]="preservedBorder"
      >
        ${mapToolButtonsTemplate}
      </div>
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
  title: 'Solargis/Components/Tool Button Group',
  decorators: [
    moduleMetadata({
      declarations: [SideAttachmentsStoryComponent],
      imports: [SgDefaultsModule, MatIconModule, MatButtonModule]
    })
  ]
};

export const normal: Story = () => ({
  template: `
    <div class="container">
      <div class="sg-tool-button-group">
        <button mat-icon-button color="primary">
          <mat-icon>zoom_in_map</mat-icon>
        </button>
        <button mat-icon-button color="primary">
          <mat-icon>zoom_out_map</mat-icon>
        </button>
      </div>

      <div class="sg-tool-button-group">
        ${mapToolButtonsTemplate}
      </div>
    </div>
  `,
  styles: [
    `.container {
        height: 100vh;
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
     }

     .sg-tool-button-group {
        margin-bottom: 8px;
     }
    `
  ]
});

export const disabled: Story = () => ({
  template: `
    <div class="container">
      <div class="sg-tool-button-group">
        ${mapToolButtonsTemplate}
        <button mat-icon-button color="primary" disabled>
          <mat-icon>map_3d</mat-icon>
        </button>
      </div>
    </div>
  `
});

export const sideAttachments: Story = () => ({
  template: `
    <h2>No border:</h2>
    <sg-side-attachments-story></sg-side-attachments-story>
    <br>
    <h2>Preserved border:</h2>
    <sg-side-attachments-story [preservedBorder]="true"></sg-side-attachments-story>
  `
});

export const interactiveIcon: Story = props => ({
  props,
  template: `
    <div class="sg-tool-button-group">
      <button mat-icon-button color="primary">
        <mat-icon>{{ icon }}</mat-icon>
      </button>
    </div>
  `
});

interactiveIcon.argTypes = {
  icon: {
    name: 'Icon',
    control: { type: 'text' },
    defaultValue: 'zoom_in_map'
  }
};
