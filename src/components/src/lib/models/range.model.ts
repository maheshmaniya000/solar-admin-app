import { isNil } from 'lodash-es';

export interface Range<T = number> {
  min: T;
  max: T;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Range {
  export const from = <T = number>(min: T, max: T): Range<T> => ({ min, max });
  export const size = (range: Range): number =>
    Math.abs(range?.max - range?.min);
  export const difference = (a: Range, b: Range): Range[] => {
    if (isNil(a) || isNil(b)) {
      return [];
    }
    const result: Range[] = [];
    if (b.min > a.min) {
      result.push({ min: a.min, max: Math.min(a.max, b.min) });
    }
    if (b.max < a.max) {
      result.push({ min: Math.max(a.min, b.max), max: a.max });
    }
    return result;
  };

  export const intersectionLength = (a: Range, b: Range): number => {
    if (a.min < b.max && a.max > b.min) {
      return Math.min(a.max, b.max) - Math.max(a.min, b.min);
    }
    return 0;
  };
}
