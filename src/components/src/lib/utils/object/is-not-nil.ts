import { isNil } from 'lodash-es';

export function isNotNil<T>(value?: T): boolean {
  return !isNil(value);
}
