import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

const containerPaddingStyles = [
  `
  .container {
    padding: 20px
  }
`
];

const containerBackgroundStyles = [
  `
  .container {
    background-color: #E4E6EA;
  }
`
];

export default {
  title: 'Solargis/Components/Toolbar',
  decorators: [
    moduleMetadata({
      imports: [
        MatToolbarModule,
        MatTabsModule,
        BrowserAnimationsModule,
        CommonModule,
        SgDefaultsModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule
      ]
    })
  ]
};

export const normal: Story = () => ({
  template: `
    <div class="container">
      <mat-toolbar>
        <button mat-icon-button color="primary">
          <mat-icon>close</mat-icon>
        </button>
        <span>Project detail</span>
        <span class="spacer"></span>
        <button class="toolbar-button" mat-button color="primary">
          <mat-icon>properties</mat-icon>
          Project properties
        </button>
        <mat-divider vertical></mat-divider>
        <button mat-icon-button color="primary">
          <mat-icon>more_vert</mat-icon>
        </button>
        <button mat-flat-button color="accent">
          Primary button
        </button>
      </mat-toolbar>
    </div>
  `,
  styles: containerPaddingStyles
});

export const small: Story = () => ({
  template: `
    <div class="container">
      <h3>Horizontal menu:</h3>
      <mat-toolbar class="small">
        <mat-tab-group color="accent">
          <mat-tab label="General"></mat-tab>
          <mat-tab label="Terrain"></mat-tab>
          <mat-tab label="System"></mat-tab>
          <mat-tab label="Goals"></mat-tab>
          <mat-tab label="Visualization"></mat-tab>
        </mat-tab-group>
      </mat-toolbar>
      <h3>Section header:</h3>
      <mat-toolbar class="small">
        <mat-icon>array_16px</mat-icon>
        <span>Section header</span>
      </mat-toolbar>
    </div>
  `,
  styles: [
    ...containerPaddingStyles,
    ...containerBackgroundStyles,
    `
    .mat-toolbar + h3 {
      margin-top: 15px;
    }
    `
  ]
});

export const extraSmall: Story = () => ({
  template: `
    <div class="container">
      <mat-toolbar class="extra-small">
        <mat-tab-group color="accent">
          <mat-tab label="Map"></mat-tab>
          <mat-tab label="Schema"></mat-tab>
        </mat-tab-group>
        <mat-divider vertical></mat-divider>
        <button mat-icon-button color="primary">
          <mat-icon>zoom_undo</mat-icon>
        </button>
        <button mat-icon-button color="primary">
          <mat-icon>zoom_redo</mat-icon>
        </button>
        <mat-divider vertical></mat-divider>
        <button mat-icon-button color="primary">
          <mat-icon>save_alt</mat-icon>
        </button>
        <span>Object inspector</span>
        <span class="spacer"></span>
        <button class="sg-small-button" mat-flat-button color="accent">
          Primary button
        </button>
        <button mat-icon-button color="primary">
          <mat-icon>info</mat-icon>
        </button>
        <mat-divider vertical></mat-divider>
        <button mat-icon-button color="primary">
          <mat-icon>map</mat-icon>
        </button>
        <button mat-icon-button color="primary">
          <mat-icon>more_vert</mat-icon>
        </button>
      </mat-toolbar>
    </div>
  `,
  styles: [
    ...containerPaddingStyles,
    `
    mat-toolbar:not(:first-of-type) {
      margin-top: 20px;
    }
    `
  ]
});

export const multiRow: Story = () => ({
  template: `
    <div class="container">
      <mat-toolbar>
        <mat-toolbar-row>First row</mat-toolbar-row>
        <mat-toolbar-row>
          Ground based fix-mounted • 1000 kWp • c-Si • Azimuth: 180° • Tilt: 36° •
          Centralized high-efficiency inverter [97.8% Euro efficiency] High efficiency
          [0.9% loss] • DC cabling 2 % • DC mismatch 0.3 % • AC cabling 0.5 % • 99.5 %
          More info
        </mat-toolbar-row>
      </mat-toolbar>
    </div>
  `,
  styles: containerPaddingStyles
});
