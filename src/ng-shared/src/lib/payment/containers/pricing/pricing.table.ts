import { TranslationDef } from '@solargis/types/translation';


type ProspectTableSectionRow = {
  type: 'section';
  icon: string;
  text: string;
};

type ProspectTableRow = {
  type: 'row';
  text: string;
  help?: string;
  freeIcon?: string;
  freeText?: string | TranslationDef;
  basicIcon?: string;
  basicText?: string | TranslationDef;
  proIcon?: string;
  proText?: string | TranslationDef;
};

const enabledIcon = 'done';
const disabledIcon = 'close';


export const table: (ProspectTableRow | ProspectTableSectionRow)[] = [
{
  type: 'section',
  text: 'payment.pricing.table.data.dataAggregation',
  icon: 'list'
},
{
  type: 'row',
  text: 'payment.pricing.table.data.annual.text',
  freeIcon: enabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon,
},
{
  type: 'row',
  text: 'payment.pricing.table.data.monthly.text',
  freeIcon: enabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon,
},
{
  type: 'row',
  text: 'payment.pricing.table.data.hourly.text',
  freeIcon: disabledIcon,
  basicText: 'payment.pricing.table.data.hourly.basic',
  proText: 'payment.pricing.table.data.hourly.basic',
},

{
  type: 'section',
  text: 'payment.pricing.table.data.dataParams',
  icon: 'list'
},
{
  type: 'row',
  text: 'payment.pricing.table.data.solar.text',
  help: 'payment.pricing.table.data.solar.help',
  freeIcon: enabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.pv.text',
  help: 'payment.pricing.table.data.pv.help',
  freeText: 'payment.pricing.table.data.pv.free',
  basicText: 'payment.pricing.table.data.pv.basic',
  proText: 'payment.pricing.table.data.pv.pro',
},
{
  type: 'row',
  text: 'payment.pricing.table.data.meteo.text',
  help: 'payment.pricing.table.data.meteo.help',
  freeIcon: enabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.meteo2.text',
  freeIcon: disabledIcon,
  basicIcon: disabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.albedo.text',
  freeIcon: disabledIcon,
  basicIcon: disabledIcon,
  proIcon: enabledIcon
},


{
  type: 'section',
  text: 'payment.pricing.table.data.features',
  icon: 'list'
},
{
  type: 'row',
  text: 'payment.pricing.table.data.save.text',
  freeIcon: enabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.configure.text',
  freeIcon: enabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.report.text',
  freeIcon: disabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.economy.text',
  help: 'payment.pricing.table.data.economy.help',
  freeIcon: disabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.compare.text',
  help: 'payment.pricing.table.data.compare.help',
  freeIcon: disabledIcon,
  basicIcon: enabledIcon,
  proIcon: enabledIcon
},
{
  type: 'row',
  text: 'payment.pricing.table.data.floating.text',
  freeIcon: disabledIcon,
  basicIcon: disabledIcon,
  proIcon: enabledIcon
},
];
