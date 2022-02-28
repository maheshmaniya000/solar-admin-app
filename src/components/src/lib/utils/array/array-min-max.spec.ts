import { arrayMinMax } from './array-min-max';

describe('arrayMinMax', () => {
  it('should throw error on when input is nil value or empty array', () => {
    [undefined, null, []].forEach(value =>
      expect(() => arrayMinMax(value)).toThrowError()
    );
  });

  it('should transform single number to array containing just that number', () => {
    expect(arrayMinMax(15.1)).toEqual([15.1]);
  });

  it('should transform array of equal numbers to array consisting of just that number', () => {
    expect(arrayMinMax([23.45, 23.45, 23.45, 23.45])).toEqual([23.45]);
  });

  it('should transform array of numbers to array consisting of min and max of that array', () => {
    expect(
      arrayMinMax([15, 25, 3, -98.55, 0, 0.0, -500000, 12, 13, 14, 15, 16])
    ).toEqual([-500000, 25]);
  });
});
