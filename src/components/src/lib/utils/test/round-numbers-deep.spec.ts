import { roundNumbersDeep } from './round-numbers-deep';

describe('roundNumbersDeep', () => {
  it('should return a copy of the provided object where all its numbers are rounded to, by default, 2 decimal places', () => {
    expect(
      roundNumbersDeep({
        a: {
          aa: 1.1149
        },
        b: 1.1149
      })
    ).toEqual({
      a: {
        aa: 1.11
      },
      b: 1.11
    });
  });

  it('should return a copy of the provided object where all its numbers are rounded to 3 decimal places', () => {
    expect(
      roundNumbersDeep(
        {
          a: {
            aa: 1.1149
          },
          b: 1.1149
        },
        3
      )
    ).toEqual({
      a: {
        aa: 1.115
      },
      b: 1.115
    });
  });

  it('should return a copy of the provided object where the boolean values are unchanged', () => {
    const booleanTestObject = {
      a: {
        aa: true,
        ab: false
      },
      b: true,
      c: false
    };
    expect(roundNumbersDeep(booleanTestObject)).toEqual(booleanTestObject);
  });

  it('should return a copy of the provided object where the string values are unchanged', () => {
    const stringTestObject = {
      a: {
        aa: '1.1149'
      },
      b: '1.1149'
    };
    expect(roundNumbersDeep(stringTestObject)).toEqual(stringTestObject);
  });
});
