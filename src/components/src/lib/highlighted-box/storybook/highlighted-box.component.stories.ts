import { MatButtonModule } from '@angular/material/button';
import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../../defaults/defaults.module';
import { HighlightedBoxModule } from '../highlighted-box.module';

export default {
  title: 'Solargis/Components/Highlighted Box',
  decorators: [
    moduleMetadata({
      imports: [MatButtonModule, HighlightedBoxModule, SgDefaultsModule]
    })
  ]
};

const styles = [
  `
    sg-highlighted-box {
      text-align: center;
    }
    `
];

export const basic: Story = () => ({
  templateUrl: './basic.template.html',
  styles: []
});

export const title: Story = () => ({
  templateUrl: './title.template.html',
  styles
});

export const longText: Story = () => ({
  templateUrl: './long-text.template.html',
  styles
});
