import { MatButtonModule } from '@angular/material/button';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { MarkerModule } from './marker.module';

export default {
  title: 'Solargis/Components/Marker',
  decorators: [
    moduleMetadata({
      imports: [MarkerModule, MatButtonModule, SgDefaultsModule]
    })
  ]
};

export const singleSelect: Story = props => ({
  props,
  template: `
    <div class="container" data-test="single-select-marker-component-story">
      <div class="markers-grid">
        <span class="label">Empty icon marker</span>
        <sg-icon-marker [selected]="selected"></sg-icon-marker>
        <span class="label">Icon marker</span>
        <sg-icon-marker icon="latlon_16px" [selected]="selected"></sg-icon-marker>
        <span class="label">Text marker</span>
        <sg-text-marker text="abcd" [selected]="selected"></sg-text-marker>
        <span class="label">Large text marker</span>
        <sg-text-marker class="large" text="ab" [selected]="selected"></sg-text-marker>
        <span class="label">Text marker without caret</span>
        <sg-text-marker text="abcd" [selected]="selected" [caretHidden]="true"></sg-text-marker>
        <span class="label">Large text marker without caret</span>
        <sg-text-marker class="large" text="ab" [selected]="selected" [caretHidden]="true"></sg-text-marker>
      </div>
    </div>
    `,
  styles: [
    `
    .container {
      height: 100vh;
      background-color: #a5adba;
    }

    .markers-grid {
      display: grid;
      width: 270px;
      grid-template-columns: repeat(2, auto);
      grid-template-rows: repeat(4, auto);
      grid-gap: 35px;
      padding: 15px;
    }

    .label {
      align-self: center;
    }
    `
  ]
});

singleSelect.argTypes = {
  selected: {
    name: 'Selected',
    control: { type: 'radio', options: [true, false] },
    defaultValue: false
  }
};
