import { isNotEmpty } from './is-not-empty';

describe('isNotEmpty', () => {
  it('should return true for non empty array', () => {
    expect(isNotEmpty([0])).toBe(true);
  });

  it('should return false for undefined', () => {
    expect(isNotEmpty(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isNotEmpty(null)).toBe(false);
  });

  it('should return false for empty array', () => {
    expect(isNotEmpty([])).toBe(false);
  });
});
