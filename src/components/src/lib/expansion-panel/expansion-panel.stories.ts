import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

@NgModule({
  imports: [SgDefaultsModule, BrowserAnimationsModule, MatExpansionModule],
  exports: [MatExpansionModule]
})
class ExpansionPanelStoryModule {}

export default {
  title: 'Solargis/Components/Expansion Panel',
  decorators: [
    moduleMetadata({
      imports: [ExpansionPanelStoryModule]
    })
  ]
};

export const interactive: Story = props => ({
  props,
  template: `
    <mat-accordion
      [displayMode]="displayMode"
      [multi]="multiAccordion"
      [togglePosition]="togglePosition"
      [hideToggle]="!displayToggle"
    >
      <mat-expansion-panel disabled>
        <mat-expansion-panel-header>Work</mat-expansion-panel-header>
        Random content.
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>Student</mat-expansion-panel-header>
        Random content.
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>Individual</mat-expansion-panel-header>
        Random content.
      </mat-expansion-panel>

      <mat-expansion-panel>
        <mat-expansion-panel-header>Other</mat-expansion-panel-header>
        Random content.
      </mat-expansion-panel>
    </mat-accordion>
   `
});

interactive.argTypes = {
  displayMode: {
    name: 'Gaps',
    control: {
      type: 'select',
      options: {
        gaps: 'default',
        'no gaps': 'flat'
      }
    },
    defaultValue: 'flat'
  },
  multiAccordion: {
    name: 'Multi accordion',
    control: { type: 'boolean' },
    defaultValue: false
  },
  displayToggle: {
    name: 'Display expansion indicator',
    control: { type: 'boolean' },
    defaultValue: false
  },
  togglePosition: {
    name: 'Expansion indicator position',
    control: {
      type: 'select',
      options: {
        before: 'before',
        after: 'after'
      }
    },
    defaultValue: 'after'
  }
};
