import { unit, Unit } from '@solargis/units';

const kWh: Unit = unit({
  html: { translate: 'units.kWh', translateParams: { defaultText: 'kWh' }},
  format: '0,0.0',
  convert: val => val,
  convertBack: val => val
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const MWh: Unit = unit({
  html: { translate: 'units.MWh', translateParams: { defaultText: 'MWh' }},
  format: '0,0.000',
  convert: val => val / 1000,
  convertBack: val => val * 1000
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const GWh: Unit = unit({
  html: { translate: 'units.GWh', translateParams: { defaultText: 'GWh' }},
  format: '0,0.000',
  convert: val => val / 1000000,
  convertBack: val => val * 1000000
});

export function parseMothlyPVOUT(data: number[]): [Unit, number[]] { // base unit is kWh
  const max = Math.max(...data);
  const u = max >= 1000000 ? GWh : max >= 1000 ? MWh : kWh;
  const d = data.map(val => u.convert(val));
  return [u, d];
}
