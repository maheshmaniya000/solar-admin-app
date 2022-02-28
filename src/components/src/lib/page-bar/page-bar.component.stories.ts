import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { PageBarModule } from './page-bar.module';

const styles = [
  `
  .container {
    width: 100%;
    height: 500px;
    display: flex;
    align-items: center;
  }
`
];
export default {
  title: 'Solargis/Components/Page Bar',
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, SgDefaultsModule, MatButtonModule, MatIconModule, PageBarModule]
    })
  ]
};

export const basic: Story = () => ({
  template: `
    <div class="container">
      <sg-page-bar></sg-page-bar>
    </div>
  `,
  styles
});

export const content: Story = () => ({
  template: `
    <div class="container">
      <sg-page-bar>
        <div class="projected-content">
          <span>Toffee apple pie apple pie chocolate cake sweet jujubes halvah</span>
          <button mat-icon-button color="accent">
            <mat-icon>add_circle_outline</mat-icon>
          </button>
        </div>
      </sg-page-bar>
    </div>
  `,
  styles: [
    ...styles,
    `
    .container {
      background-color: white;
    }
    
    button {
      margin-left: 20px;
    }
    
    .projected-content {
      display: flex;
      align-items: center;
      max-height: 100%;
    }
  `
  ]
});
