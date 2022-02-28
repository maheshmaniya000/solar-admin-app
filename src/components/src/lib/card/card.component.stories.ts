import { MatCardModule } from '@angular/material/card';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Components/Card',
  decorators: [
    moduleMetadata({
      imports: [MatCardModule, SgDefaultsModule]
    })
  ]
};

export const all: Story = props => ({
  props,
  template: `
    <mat-card>Simple card</mat-card>
  `
});
