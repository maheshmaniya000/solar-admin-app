import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../defaults/defaults.module';

export default {
  title: 'Solargis/Layout/Grid',
  decorators: [
    moduleMetadata({
      imports: [SgDefaultsModule]
    })
  ]
};

const styles = [
  `
    .yellow-block {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f4b300;
      height: 50px;
      text-align: center;
      padding: 2px 10px;
    }

    .red-block {
      background-color: #c31e21;
      height: 50px;
    }
  `
];

export const grid8and15: Story = () => ({
  templateUrl: './grid-8-15.template.html',
  styles
});

export const grid12and11: Story = () => ({
  templateUrl: './grid-12-11.template.html',
  styles
});

export const grid16and7: Story = () => ({
  templateUrl: './grid-16-7.template.html',
  styles
});

export const noLeadingTrack: Story = () => ({
  templateUrl: './no-leading-track.template.html',
  styles: [
    ...styles,
    `
      [class*='sg-grid-'] {
        margin-bottom: 10px
      }

      .divided {
        margin-top: 10px;
        margin-bottom: 0;
        border-top: 1px solid black;
      }
    `
  ]
});

export const rowNext: Story = () => ({
  templateUrl: './row-next.template.html',
  styles: [
    ...styles,
    `
      [class*='sg-grid-'] {
        margin-bottom: 10px
      }

      .divided {
        margin-top: 10px;
        margin-bottom: 0;
        border-top: 1px solid black;
      }
    `
  ]
});
