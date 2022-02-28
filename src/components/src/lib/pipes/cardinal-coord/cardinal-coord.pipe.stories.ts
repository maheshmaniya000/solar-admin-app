import { moduleMetadata, Story } from '@storybook/angular';

import { SgDefaultsModule } from '../../defaults/defaults.module';
import { SgPipesModule } from '../pipes.module';

export default {
  title: 'Solargis/Pipes/Cardinal coordinates',
  decorators: [
    moduleMetadata({
      imports: [SgPipesModule, SgDefaultsModule]
    })
  ]
};

const rows = [0, 45, 90, 135, 180, 225, 270, 315, 360]
  .map(value => `<td>${value}</td><td>{{${value} | sgCardinalCoord}}</td>`)
  .map(row => `<tr>${row}</tr>`)
  .join('');

export const allCases: Story = () => ({
  template: `<table>
    <tr>
        <th>Value</th><th>Result</th>
    </tr>
    ${rows}
    </table>`
});

export const customValue: Story = props => ({
  props,
  template: `{{value}} => {{value | sgCardinalCoord}}`
});

customValue.argTypes = {
  value: {
    name: 'Value',
    control: { type: 'range', min: 0, max: 360, step: 1 },
    defaultValue: 180
  }
};
