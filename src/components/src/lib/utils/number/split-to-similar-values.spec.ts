import { splitToSimilarValues } from './split-to-similar-values';

describe('splitToSimilarValues', () => {
  it(`should throw error when count is not greater than zero`, () => {
    expect(() => splitToSimilarValues(10, 0)).toThrow();
    expect(() => splitToSimilarValues(10, -1)).toThrow();
  });

  it(`should throw error when value is not greater than zero`, () => {
    expect(() => splitToSimilarValues(0, 5)).toThrow();
    expect(() => splitToSimilarValues(-1, 5)).toThrow();
  });

  it(`should throw error when value is smaller than count`, () => {
    expect(() => splitToSimilarValues(10, 11)).toThrow();
  });

  it(`should return correct numbers`, () => {
    expect(splitToSimilarValues(10, 1)).toEqual([10]);
    expect(splitToSimilarValues(10, 2)).toEqual([5, 5]);
    expect(splitToSimilarValues(10, 3)).toEqual([4, 3, 3]);
    expect(splitToSimilarValues(10, 4)).toEqual([3, 3, 2, 2]);
    expect(splitToSimilarValues(10, 5)).toEqual([2, 2, 2, 2, 2]);
    expect(splitToSimilarValues(10, 6)).toEqual([2, 2, 2, 2, 1, 1]);
    expect(splitToSimilarValues(10, 7)).toEqual([2, 2, 2, 1, 1, 1, 1]);
    expect(splitToSimilarValues(10, 8)).toEqual([2, 2, 1, 1, 1, 1, 1, 1]);
    expect(splitToSimilarValues(10, 9)).toEqual([2, 1, 1, 1, 1, 1, 1, 1, 1]);
    expect(splitToSimilarValues(10, 10)).toEqual([
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1
    ]);
  });
});
