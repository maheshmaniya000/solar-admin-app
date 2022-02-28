import { isNaturalNumberOrZero } from './is-natural-number-or-zero';

describe('isNaturalNumberOrZero', () => {
  it('should return false if number is not natural or zero', () => {
    expect(isNaturalNumberOrZero(undefined)).toBe(false);
    expect(isNaturalNumberOrZero(null)).toBe(false);
    expect(isNaturalNumberOrZero(-5)).toBe(false);
    expect(isNaturalNumberOrZero(10.1)).toBe(false);
  });

  it('should return true if number is natural or zero', () => {
    expect(isNaturalNumberOrZero(0)).toBe(true);
    expect(isNaturalNumberOrZero(1)).toBe(true);
    expect(isNaturalNumberOrZero(15151000)).toBe(true);
  });
});
