import { isNil, range } from 'lodash-es';

import { isNaturalNumber } from './is-natural-number';

export function factorize(value: number): number[] {
  if (isNil(value) || !isNaturalNumber(value)) {
    throw new Error('Factorize accepts only natural numbers');
  }
  return range(1, value + 1).filter(i => value % i === 0);
}

export function factorPairs(value: number): [number, number][] {
  return factorize(value).map(factor => [factor, value / factor]);
}
