import { nextMultipleOf, previousMultipleOf } from './multiple-of';

describe('nextMultipleOf', () => {
  it('should return next multiple of given number', () => {
    [
      [-30.1, -30],
      [-29.9, -15],
      [-15.1, -15],
      [-15, -15],
      [-14.9, 0],
      [-0.1, 0],
      [0, 0],
      [0.1, 15],
      [14.9, 15],
      [15, 15],
      [15.1, 30]
    ].forEach(([value, expected]) => {
      expect(nextMultipleOf(value, 15)).toBe(expected);
    });
  });

  it('should return next multiple of given number with given offset', () => {
    [
      [-29.1, -29],
      [-28.9, -14],
      [-14.1, -14],
      [-14, -14],
      [-13.9, 1],
      [0.9, 1],
      [1, 1],
      [1.1, 16],
      [15.9, 16],
      [16, 16],
      [16.1, 31]
    ].forEach(([value, expected]) => {
      expect(nextMultipleOf(value, 15, 1)).toBe(expected);
    });
  });
});

describe('previousMultipleOf', () => {
  it('should return previous multiple of given number', () => {
    [
      [-30.1, -45],
      [-29.9, -30],
      [-15.1, -30],
      [-15, -15],
      [-14.9, -15],
      [-0.1, -15],
      [0, 0],
      [0.1, 0],
      [14.9, 0],
      [15, 15],
      [15.1, 15]
    ].forEach(([value, expected]) => {
      expect(previousMultipleOf(value, 15)).toBe(expected);
    });
  });

  it('should return previous multiple of given number with given offset', () => {
    [
      [-29.1, -44],
      [-28.9, -29],
      [-14.1, -29],
      [-14, -14],
      [-13.9, -14],
      [0.9, -14],
      [1, 1],
      [1.1, 1],
      [15.9, 1],
      [16, 16],
      [16.1, 16]
    ].forEach(([value, expected]) => {
      expect(previousMultipleOf(value, 15, 1)).toBe(expected);
    });
  });
});
