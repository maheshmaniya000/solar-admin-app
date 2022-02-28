import { isPlainObject, mapValues } from 'lodash-es';

export function mapValuesDeep(obj: any, callback: (val: any) => any): any {
  return isPlainObject(obj)
    ? mapValues(obj, childObj => mapValuesDeep(childObj, callback))
    : callback(obj);
}
