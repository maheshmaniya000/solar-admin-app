import { isCloseTo } from './is-close-to';

describe('isCloseTo', () => {
  it('should return true when number is close to other number for default tolerance', () => {
    expect(isCloseTo(8.9951, 9)).toBe(true);
    expect(isCloseTo(9, 9)).toBe(true);
    expect(isCloseTo(9.0049, 9)).toBe(true);
  });

  it('should return false when number is not close to other number for default tolerance', () => {
    expect(isCloseTo(8.995, 9)).toBe(false);
    expect(isCloseTo(9.005, 9)).toBe(false);
  });

  it('should return true when number is close to other number for custom tolerance', () => {
    expect(isCloseTo(8.51, 9, 0.5)).toBe(true);
    expect(isCloseTo(9, 9, 0.5)).toBe(true);
    expect(isCloseTo(9.49, 9, 0.5)).toBe(true);
  });

  it('should return false when number is not close to other number for custom tolerance', () => {
    expect(isCloseTo(8.5, 9, 0.5)).toBe(false);
    expect(isCloseTo(9.5, 9, 0.5)).toBe(false);
  });
});
