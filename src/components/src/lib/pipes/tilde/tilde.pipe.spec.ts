import { Decimal } from 'decimal.js';

import { TildePipe } from './tilde.pipe';

describe('TildePipe', () => {
  let pipe: TildePipe;

  beforeEach(() => (pipe = new TildePipe()));

  it('should return undefined for undefined input', () => {
    expect(pipe.transform(undefined)).toBe(undefined);
  });

  it('should return undefined for null input', () => {
    expect(pipe.transform(null)).toBe(undefined);
  });

  it(`should return formatted rounded number with tilde when rounding happened when using default config`, () => {
    expect(pipe.transform(1.234)).toBe('~1.23');
  });

  it(`should return formatted number without tilde when no rounding happened when using default config`, () => {
    expect(pipe.transform(1)).toBe('1');
    expect(pipe.transform(1.2)).toBe('1.2');
    expect(pipe.transform(1.23)).toBe('1.23');
  });

  it(`should return formatted rounded number with tilde when rounding happened`, () => {
    expect(pipe.transform(1.2, { decimalPlaces: 0 })).toBe('~1');
    expect(pipe.transform(1.23, { decimalPlaces: 1 })).toBe('~1.2');
    expect(pipe.transform(1.2345, { decimalPlaces: 2 })).toBe('~1.23');
  });

  it(`should return formatted rounded number with tilde when rounding happened with custom rounding mode`, () => {
    expect(
      pipe.transform(1.2, { decimalPlaces: 0, rounding: Decimal.ROUND_UP })
    ).toBe('~2');
    expect(
      pipe.transform(1.23, { decimalPlaces: 1, rounding: Decimal.ROUND_UP })
    ).toBe('~1.3');
    expect(
      pipe.transform(1.2345, { decimalPlaces: 2, rounding: Decimal.ROUND_UP })
    ).toBe('~1.24');
    expect(pipe.transform(1.2345, { rounding: Decimal.ROUND_UP })).toBe(
      '~1.24'
    );
  });

  it(`should return formatted rounded number with tilde when rounding happened with custom digits info`, () => {
    expect(pipe.transform(1.2, { decimalPlaces: 0, digitsInfo: '1.4-4' })).toBe(
      '~1.0000'
    );
    expect(
      pipe.transform(1.23, { decimalPlaces: 1, digitsInfo: '1.5-5' })
    ).toBe('~1.20000');
    expect(
      pipe.transform(1.2345, { decimalPlaces: 2, digitsInfo: '1.6-6' })
    ).toBe('~1.230000');
    expect(pipe.transform(1.2345, { digitsInfo: '1.6-6' })).toBe('~1.230000');
  });

  it(`should return formatted number without tilde when no rounding happened`, () => {
    expect(pipe.transform(1, { decimalPlaces: 0 })).toBe('1');
    expect(pipe.transform(1.2, { decimalPlaces: 1 })).toBe('1.2');
    expect(pipe.transform(1.23, { decimalPlaces: 2 })).toBe('1.23');
    expect(pipe.transform(1.2345, { decimalPlaces: 4 })).toBe('1.2345');
  });
});
