import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';

/**
 * Months translation array
 */
export const months = [
  'months.jan',
  'months.feb',
  'months.mar',
  'months.apr',
  'months.may',
  'months.jun',
  'months.jul',
  'months.aug',
  'months.sep',
  'months.oct',
  'months.nov',
  'months.dec'
];

export function monthsTranslated$(transloco: TranslocoService): Observable<string[]> {
  return transloco.selectTranslate(months);
}

export const yearly = 'months.yearly';
