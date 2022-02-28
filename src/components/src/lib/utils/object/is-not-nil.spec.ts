import { isNotNil } from './is-not-nil';

describe('isNotNil', () => {
  ['something', '', 0, true, false, -1].forEach(value =>
    it(`should return true for ${value}`, () =>
      expect(isNotNil(value)).toBe(true))
  );

  it('should return false for undefined', () => {
    expect(isNotNil(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isNotNil(null)).toBe(false);
  });
});
