import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Components/Tab',
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        SgDefaultsModule,
        CommonModule,
        MatTabsModule
      ]
    })
  ]
};

export const all: Story = props => ({
  props,
  template: `
    <mat-tab-group [(selectedIndex)]="activeTabIndex" color="accent">
      <mat-tab label="First"></mat-tab>
      <mat-tab label="Second"></mat-tab>
      <mat-tab label="Third"></mat-tab>
      <mat-tab label="Fourth"></mat-tab>
      <mat-tab label="Fifth"></mat-tab>
    </mat-tab-group>
    <div [ngSwitch]="activeTabIndex">
      <ng-container *ngSwitchCase="0">Content 1</ng-container>
      <ng-container *ngSwitchCase="1">Content 2</ng-container>
      <ng-container *ngSwitchCase="2">Content 3</ng-container>
      <ng-container *ngSwitchCase="3">Content 4</ng-container>
      <ng-container *ngSwitchCase="4">Content 5</ng-container>
    </div>
  `
});

all.args = {
  activeTabIndex: 0
};
