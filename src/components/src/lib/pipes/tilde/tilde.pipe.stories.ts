import { moduleMetadata, Story } from '@storybook/angular';
import { Decimal } from 'decimal.js';

import { SgDefaultsModule } from '../../defaults/defaults.module';
import { SgPipesModule } from '../pipes.module';

export default {
  title: 'Solargis/Pipes/Tilde',
  decorators: [
    moduleMetadata({
      imports: [SgPipesModule, SgDefaultsModule]
    })
  ]
};

export const all: Story = () => ({
  template: `
  <p>1.2345 (default config): {{1.2345 | sgTilde}}</p>
  <h3>Decimal places</h3>
  <p>1.2345 (3 decimal places): {{1.2345 | sgTilde: {decimalPlaces: 3} }}</p>
  <p>1.2345 (1 decimal place): {{1.2345 | sgTilde: {decimalPlaces: 1} }}</p>
  <h3>Rounding (<small><a href="https://mikemcl.github.io/decimal.js/#modes">Decimal.js rounding modes</a></small>)</h3>
  <p>1.2345 (Decimal.ROUND_FLOOR): {{1.2345 | sgTilde: {rounding: ${Decimal.ROUND_FLOOR}} }}</p>
  <p>1.2345 (Decimal.ROUND_CEIL): {{1.2345 | sgTilde: {rounding: ${Decimal.ROUND_CEIL}} }}</p>
  <h3>Digits info (<small><a href="https://angular.io/api/common/DecimalPipe#parameters">DecimalPipe digitsInfo</a></small>)</h3>
  <p>1.2345 ('1.0-3'): {{1.2345 | sgTilde: {digitsInfo: '1.0-3'} }}</p>
  <p>1.2345 ('1.3-3'): {{1.2345 | sgTilde: {digitsInfo: '1.3-3'} }}</p>
  <h3>No rounding</h3>
  <p>1.23 (default config): {{1.23 | sgTilde }}</p>
  <p>1.29 (default config): {{1.29 | sgTilde }}</p>
  <p>1.2 (1 decimal place): {{1.2 | sgTilde: {decimalPlaces: 1} }}</p>
  `
});

export const interactive: Story = props => ({
  props,
  template:
    '{{ value | sgTilde: {decimalPlaces: decimalPlaces, rounding: rounding, digitsInfo: digitsInfo} }}'
});

interactive.argTypes = {
  value: {
    name: 'Value',
    control: { type: 'number' },
    defaultValue: 1.2345
  },
  decimalPlaces: {
    name: 'Decimal places',
    control: { type: 'number' },
    defaultValue: 2
  },
  rounding: {
    name: 'Rounding',
    control: {
      type: 'select',
      labels: [
        'ROUND_UP',
        'ROUND_DOWN',
        'ROUND_CEIL',
        'ROUND_FLOOR',
        'ROUND_HALF_UP',
        'ROUND_HALF_DOWN',
        'ROUND_HALF_EVEN',
        'ROUND_HALF_CEIL',
        'ROUND_HALF_FLOOR'
      ]
    },
    options: [
      Decimal.ROUND_UP,
      Decimal.ROUND_DOWN,
      Decimal.ROUND_CEIL,
      Decimal.ROUND_FLOOR,
      Decimal.ROUND_HALF_UP,
      Decimal.ROUND_HALF_DOWN,
      Decimal.ROUND_HALF_EVEN,
      Decimal.ROUND_HALF_CEIL,
      Decimal.ROUND_HALF_FLOOR
    ],
    defaultValue: Decimal.ROUND_HALF_UP
  },
  digitsInfo: {
    name: 'Digits info',
    control: { type: 'text' },
    defaultValue: '1.0-2'
  }
};
