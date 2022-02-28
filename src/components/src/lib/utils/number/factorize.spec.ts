import { factorize, factorPairs } from './factorize';

describe('factorize', () => {
  it('should throw error for undefined and null', () => {
    [undefined, null].forEach(value =>
      expect(() => factorize(value)).toThrow()
    );
  });

  it('should throw error for non natural value', () => {
    [-1, 0, 1.25].forEach(value => expect(() => factorize(value)).toThrow());
  });

  it('should factorize natural number', () => {
    expect(factorize(10)).toEqual([1, 2, 5, 10]);
    expect(factorize(19)).toEqual([1, 19]);
    expect(factorize(100)).toEqual([1, 2, 4, 5, 10, 20, 25, 50, 100]);
  });
});

describe('factorPairs', () => {
  it('should create factor pairs for natural number', () => {
    expect(factorPairs(9)).toEqual([
      [1, 9],
      [3, 3],
      [9, 1]
    ]);
    expect(factorPairs(10)).toEqual([
      [1, 10],
      [2, 5],
      [5, 2],
      [10, 1]
    ]);
  });
});
