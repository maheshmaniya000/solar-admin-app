import { removeNegativeZerosDeep } from './remove-negative-zeros-deep';

describe('removeNegativeZerosDeep', () => {
  it('should return a copy of the provided object where all its values that were negative zero are zero', () => {
    expect(
      removeNegativeZerosDeep({
        a: {
          aa: -0
        },
        b: -0
      })
    ).toEqual({
      a: {
        aa: 0
      },
      b: 0
    });
  });

  it('should return a copy of the provided object where number values that are not a negative zero are unchanged', () => {
    const testObject = {
      a: {
        aa: -1.1234,
        ab: 1.1234,
        ac: 0
      },
      b: -1.1234,
      c: 1.1234,
      d: 0
    };
    expect(removeNegativeZerosDeep(testObject)).toEqual(testObject);
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
    expect(removeNegativeZerosDeep(booleanTestObject)).toEqual(
      booleanTestObject
    );
  });

  it('should return a copy of the provided object where the string values are unchanged', () => {
    const stringTestObject = {
      a: {
        aa: '1.1149'
      },
      b: '1.1149'
    };
    expect(removeNegativeZerosDeep(stringTestObject)).toEqual(stringTestObject);
  });
});
