import { isNaturalNumber } from './is-natural-number';

describe('isNaturalNumber', () => {
  it('should return false if number is not natural', () => {
    expect(isNaturalNumber(undefined)).toBe(false);
    expect(isNaturalNumber(null)).toBe(false);
    expect(isNaturalNumber(-5)).toBe(false);
    expect(isNaturalNumber(0)).toBe(false);
    expect(isNaturalNumber(10.1)).toBe(false);
  });

  it('should return true if number is natural', () => {
    expect(isNaturalNumber(1)).toBe(true);
    expect(isNaturalNumber(15151000)).toBe(true);
  });
});
