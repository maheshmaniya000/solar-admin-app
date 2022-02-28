import { calculatePercentageWithinRange } from './calculate-percentage-within-range';

describe('calculatePercentageWithinRange', () => {
  const min = 5;
  const max = 25;

  it('should return correct percentage value', () => {
    ([
      {
        testValue: 5,
        expectedValue: 0
      },
      {
        testValue: 6,
        expectedValue: 5
      },
      {
        testValue: 7.25,
        expectedValue: 11.25
      },
      {
        testValue: 15,
        expectedValue: 50
      },
      {
        testValue: 15.3899,
        expectedValue: 51.9495
      },
      {
        testValue: 21.9999,
        expectedValue: 84.9995
      },
      {
        testValue: 24.01,
        expectedValue: 95.05
      },
      {
        testValue: 25,
        expectedValue: 100
      }
    ] as {
      testValue: number;
      expectedValue: number;
    }[]).forEach(({ testValue, expectedValue }) =>
      expect(calculatePercentageWithinRange(testValue, min, max)).toBeCloseTo(
        expectedValue
      )
    );
  });

  it('should return 0 when `value` is less than `min`', () => {
    [-11.22, -0.001, 0, 4.99].forEach(testValue =>
      expect(calculatePercentageWithinRange(testValue, min, max)).toBe(0)
    );
  });

  it('should return 100 when `value` is greater than `max`', () => {
    [25.001, 51, 1020.2].forEach(testValue =>
      expect(calculatePercentageWithinRange(testValue, min, max)).toBe(100)
    );
  });

  it('should throw when some of the inputs are of nil value', () => {
    ([
      {
        value: undefined,
        min,
        max
      },
      {
        value: null,
        min,
        max
      },
      {
        value: 5,
        min: undefined,
        max
      },
      {
        value: 5,
        min: null,
        max
      },
      {
        value: 5,
        min,
        max: undefined
      },
      {
        value: 5,
        min,
        max: null
      }
    ] as {
      value: number;
      min: number;
      max: number;
    }[]).forEach(({ value, min: aliasedMin, max: aliasedMax }) =>
      expect(() =>
        calculatePercentageWithinRange(value, aliasedMin, aliasedMax)
      ).toThrow()
    );
  });
});
