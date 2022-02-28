import { Decimal } from 'decimal.js';

import { roundTo } from './round-to';

describe('roundTo', () => {
  it(`should return correct rounded number`, () => {
    expect(roundTo(0.000546)).toBe(0.000546);
    expect(roundTo(2.3358, 2)).toBe(2.34);
  });

  it(`should return correct rounded number with rounding mode`, () => {
    expect(roundTo(2.335, 2, Decimal.ROUND_DOWN)).toBe(2.33);
    expect(roundTo(2.331, 2, Decimal.ROUND_UP)).toBe(2.34);
  });
});
