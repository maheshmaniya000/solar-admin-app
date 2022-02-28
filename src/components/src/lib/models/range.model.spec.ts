import { Range } from './range.model';

describe('Range', () => {
  describe('size', () => {
    ([
      { testValue: Range.from<number>(undefined, undefined), expectedValue: NaN },
      { testValue: Range.from<number>(null, null), expectedValue: 0 },
      { testValue: Range.from<number>(undefined, null), expectedValue: NaN },
      { testValue: Range.from<number>(null, undefined), expectedValue: NaN },
      { testValue: Range.from(5, 6), expectedValue: 1 },
      { testValue: Range.from(-5, 6), expectedValue: 11 },
      { testValue: Range.from(5, -6), expectedValue: 11 },
      { testValue: Range.from(-5, -6), expectedValue: 1 },
      { testValue: Range.from(6, 5), expectedValue: 1 },
      { testValue: Range.from(10, 10), expectedValue: 0 }
    ] as {
      testValue: Range;
      expectedValue: number;
    }[]).forEach(({ testValue, expectedValue }) =>
      it(`should return correct size of range ${JSON.stringify(
        testValue
      )}`, () => expect(Range.size(testValue)).toBe(expectedValue))
    );
  });
});
