import { moduleMetadata, Story } from '@storybook/angular';

import { QuantityModule } from './quantity.module';

const createTemplate = (
  titlePropName = 'title',
  subTitlePropName = 'subTitle',
  valuePropName = 'value',
  unitHtmlPropName = 'unitHtml'
): string => `
  <sg-quantity
    [title]="${titlePropName}"
    [subTitle]="${subTitlePropName}"
    [value]="${valuePropName}"
    [unitHtml]="${unitHtmlPropName}">
  </sg-quantity>
`;

const styles = [
  `
    sg-quantity {
      width: max(150px, 15%);
      padding: 10px;
    }
  `
];

export default {
  title: 'Solargis/Components/Quantity',
  decorators: [
    moduleMetadata({ imports: [QuantityModule] })
  ]
};

export const basic: Story = () => ({
  template: createTemplate(),
  props: {
    title: { text: 'Air temperature', lineCount: 1 },
    subTitle: { text: 'Yearly average', lineCount: 1 },
    value: 25.4,
    unitHtml: '°C'
  },
  styles
});

export const multiline: Story = () => ({
  template: `
    <div class="wrapper" data-test="multiline-quantity-story">
      ${createTemplate('title1', 'subTitle1', 'value1', 'unitHtml1')}
      ${createTemplate('title2', 'subTitle2', 'value2', 'unitHtml2')}
      ${createTemplate('title3', 'subTitle3', 'value3', 'unitHtml3')}
      ${createTemplate('title4', 'subTitle4', 'value4', 'unitHtml4')}
    </div>
  `,
  props: {
    title1: { text: 'Specific photovoltaic power output yield', lineCount: 2 },
    subTitle1: { text: 'Yearly average', lineCount: 1 },
    value1: 940.1,
    unitHtml1: 'kWh/kWp',

    title2: { text: 'Global horizontal irradiation', lineCount: 1 },
    subTitle2: {
      text: 'Average monthly sum of global horizontal irradiation',
      lineCount: 2
    },
    value2: 153,
    unitHtml2: 'Wh/m<sup>2</sup>',

    title3: { text: 'Capacity factor', lineCount: 3 },
    value3: 7.4,
    unitHtml3: '%',

    title4: {
      text:
        'Total system performance considering technical availability and losses due to snow',
      lineCount: 3
    },
    value4: 1177.7,
    unitHtml4: 'kWh/kWp'
  },
  styles: styles.concat([
    `
      .wrapper {
        display: flex;
        flex-wrap: wrap;
      }
    `
  ])
});

export const interactive: Story = props => ({
  props,
  template: createTemplate(),
  styles
});

interactive.argTypes = {
  title: {
    name: 'Title',
    control: { type: 'object' },
    defaultValue: {
      text: 'Global horizontal irradiation',
      lineCount: 1
    }
  },
  subTitle: {
    name: 'Sub title',
    control: {type: 'object'},
    defaultValue: {
      text:
        'Average annual, monthly or daily sum of global horizontal irradiation',
      lineCount: 1
    }
  },
  value: {
    name: 'Value',
    control: {type: 'number'},
    defaultValue: 153
  },
  unitHtml: {
    name: 'Unit',
    control: {type: 'text'},
    defaultValue: 'Wh/m<sup>2</sup>'
  }
};
