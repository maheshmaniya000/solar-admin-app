import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Components/Slider',
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MatSliderModule, SgDefaultsModule]
    })
  ]
};

export const basic: Story = () => ({
  template: `
    <mat-slider data-test="basic-slider-story"></mat-slider>
  `
});

export const singlePoint: Story = () => ({
  template: `
    <mat-slider
      class="single-point"
      data-test="single-point-slider-story"
    >
    </mat-slider>
  `
});

export const interactive: Story = props => ({
  props,
  template: `
    <mat-slider
      [value]="value"
      [min]="min"
      [max]="max"
      [step]="step"
      [disabled]="disabled"
      data-test="interactive-slider-story"
      #slider
    >
    </mat-slider>
    <br/>
    Value: {{slider.value}}
  `
});

interactive.argTypes = {
  value: { name: 'Value', control: { type: 'number' }, defaultValue: 15 },
  min: { name: 'Min value', control: { type: 'number' }, defaultValue: '0' },
  max: {
    name: 'Max value',
    control: { type: 'number' },
    defaultValue: 100
  },
  step: {
    name: 'Step size',
    control: { type: 'number' },
    defaultValue: 1
  },
  disabled: {
    name: 'Disabled',
    control: { type: 'boolean' }
  }
};
