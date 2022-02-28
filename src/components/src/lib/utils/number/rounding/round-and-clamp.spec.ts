import { roundAndClamp } from './round-and-clamp';

describe('roundAndClamp', () => {
  it('should return rounded value when value after rounding is within range', () => {
    const config = {
      min: 4,
      max: 10,
      decimals: 0
    };
    expect(roundAndClamp(5.4, config)).toEqual(5);
    expect(roundAndClamp(5.6, config)).toEqual(6);
  });

  it('should clamp to rounded min when rounded value is smaller than min', () => {
    expect(
      roundAndClamp(5.3, {
        min: 5.2,
        max: 10,
        decimals: 0
      })
    ).toEqual(6);
  });

  it('should clamp to rounded max when value is greater than max', () => {
    expect(
      roundAndClamp(6.5, {
        min: 5.2,
        max: 6.4,
        decimals: 0
      })
    ).toEqual(6);
  });
});
