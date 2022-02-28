import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { moduleMetadata } from '@storybook/angular';

import { SgDefaultsModule } from '../../../defaults/defaults.module';

export class ToolButtonToggleGroupStoriesConstants {
  static readonly moduleDefinition = {
    title: 'Solargis/Components/Tool Button Toggle Group',
    decorators: [
      moduleMetadata({
        imports: [
          CommonModule,
          MatButtonToggleModule,
          MatIconModule,
          SgDefaultsModule
        ]
      })
    ]
  };

  static readonly largeIconsButtonTogglesTemplate = `
  <mat-button-toggle checked data-test="solar-meteo-button-toggle">
    <mat-icon>solar_meteo</mat-icon>
  </mat-button-toggle>
  <mat-button-toggle data-test="verified-button-toggle">
    <mat-icon>verified</mat-icon>
  </mat-button-toggle>
  <mat-button-toggle data-test="archive-button-toggle">
    <mat-icon>archive</mat-icon>
  </mat-button-toggle>
  <mat-button-toggle data-test="3d-map-button-toggle">
    <mat-icon>map_3d</mat-icon>
  </mat-button-toggle>
  <mat-button-toggle data-test="main-button-toggle">
    <mat-icon>main</mat-icon>
  </mat-button-toggle>
`;

  static readonly buttonTogglesSubGroupTemplate = `
  <div class="sub-group">
    <mat-button-toggle data-test="select-table-button-toggle">
    <mat-icon>select_table</mat-icon>
    </mat-button-toggle>
    <mat-button-toggle data-test="forecast-app-button-toggle">
      <mat-icon>app_forecast</mat-icon>
    </mat-button-toggle>
  </div>
`;
}
