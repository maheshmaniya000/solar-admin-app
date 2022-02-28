import { roundToSignificantDigits } from './round-to-significant-digits';

describe('roundToSignificantDigits', () => {
  it(`should return correct number rounded to significant digits`, () => {
    expect(roundToSignificantDigits(0.000546)).toBe(0.0005);
    expect(roundToSignificantDigits(2.3358)).toBe(2);
    expect(roundToSignificantDigits(0.03358)).toBe(0.03);
    expect(roundToSignificantDigits(0.000566)).toBe(0.0006);
    expect(roundToSignificantDigits(0.000566, 2)).toBe(0.00057);
    expect(roundToSignificantDigits(9856.566, 2)).toBe(9900);
  });
});
