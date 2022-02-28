import { decimalPlaces } from './decimal-places';

describe('decimalPlaces', () => {
  it(`should return correct decimal places count of a number`, () => {
    expect(decimalPlaces(0.000546)).toBe(6);
    expect(decimalPlaces(-2.3358)).toBe(4);
    expect(decimalPlaces(0.0)).toBe(0);
    expect(decimalPlaces(0)).toBe(0);
  });
});
