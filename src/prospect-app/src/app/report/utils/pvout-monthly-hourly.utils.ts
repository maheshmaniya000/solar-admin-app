import { unit, Unit } from '@solargis/units';

// eslint-disable-next-line @typescript-eslint/naming-convention
const Wh: Unit = unit({
  html: { translate: 'units.Wh', translateParams: { defaultText: 'Wh' }},
  format: '0',
  convert: val => val,
  convertBack: val => val
});

const kWh: Unit = unit({
  html: { translate: 'units.kWh', translateParams: { defaultText: 'kWh' }},
  format: '0,0.0',
  convert: val => val / 1000,
  convertBack: val => val * 1000
});

// eslint-disable-next-line @typescript-eslint/naming-convention
const MWh: Unit = unit({
  html: { translate: 'units.MWh', translateParams: { defaultText: 'MWh' }},
  format: '0,0.000',
  convert: val => val / 1000000,
  convertBack: val => val * 1000000
});

export function parseMothlyHourlyPVOUT(data: number[]): [Unit, number[]] { // base unit is Wh
  const max = Math.max(...data);
  const u = max >= 1000000 ? MWh : max >= 1000 ? kWh : Wh;
  const d = data.map(val => u.convert(val));
  return [u, d];
}
