import { Meta, moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';
import { MegaButtonIcon } from './mega-button-icon.enum';
import { MegaButtonComponent } from './mega-button.component';
import { MegaButtonModule } from './mega-button.module';

const styles = [
  `
  .container {
      display: grid;
      grid-template-columns: repeat(3, minmax(180px, 250px));
      column-gap: 1rem;
      row-gap: 1rem;
    }
  `
];

const allIcons = Object.keys(MegaButtonIcon).map(key => MegaButtonIcon[key]).sort();

export default {
  title: 'Solargis/Components/Mega Button',
  component: MegaButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [SgDefaultsModule, MegaButtonModule]
    })
  ],
  argTypes: {
    onClick: { action: 'clicked', table: { disable: true }, control:false },
    allIcons: { table: { disable: true } }
  },
  args: {
    allIcons
  }
} as Meta;

export const standard: Story = props => ({
  props,
  template: `<sg-mega-button [icon]="icon" (click)="onClick()">{{label}}</sg-mega-button>`,
  styles
});

export const all: Story = props => ({
  props,
  template: `
      <div class="container">
        <sg-mega-button *ngFor="let icon of allIcons" [icon]="icon">{{icon}}</sg-mega-button>
      </div>`,
  styles
});

const argTypes = {
  icon: {
    name: 'Icon',
    options: allIcons,
    control: { type: 'select' },
    defaultValue: MegaButtonIcon['app-prospect']
  },
  label: {
    name: 'Label',
    control: { type: 'text' },
    defaultValue: 'Prospect Professional'
  }
};

standard.argTypes = argTypes;
