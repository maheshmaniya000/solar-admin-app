import { isEmpty } from 'lodash-es';

export function filterByName<T extends { name: string }>(values: T[], valueFilter?: T | string): T[] {
  return isEmpty(valueFilter)
    ? values
    : values.filter(value => typeof valueFilter === 'string' && value.name.toLowerCase().includes(valueFilter.toLowerCase()));
}
