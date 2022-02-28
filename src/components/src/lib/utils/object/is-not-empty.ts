import { isEmpty } from 'lodash-es';

export function isNotEmpty<T>(value?: T): boolean {
  return !isEmpty(value);
}
