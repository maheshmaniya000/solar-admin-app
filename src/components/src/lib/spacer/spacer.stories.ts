import { Story } from '@storybook/angular';

export default {
  title: 'Solargis/Layout/Spacer'
};

export const basic: Story = props => ({
  props,
  template: `
    <p>
      .spacer is an util class that separates content to the sides. It has to be
      placed inside a block with 'display: flex' usually on span, div or similar
      element
    </p>
    <div class="container">
      <span class="left-content">Left content</span>
      <span class="spacer"></span>
      <span class="right-content">Right content</span>
    </div>
  `,
  styles: [
    `
    .container {
      display: flex;
      width: 500px;
      height: 100px;
      color: white;
      border: 1px solid black;
    }

    .left-content {
      background-color: red;
      border: 3px solid lime;
    }

    .right-content {
      background-color: blue;
      border: 3px solid lime;
    }
  `
  ]
});
