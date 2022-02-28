import { HttpClient } from '@angular/common/http';
import { Sort as MaterialSort } from '@angular/material/sort';
import { isEmpty, isNil } from 'lodash-es';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { NumberTuple, Sort, StringTuple } from '@solargis/types/api';
import { OrderWithoutInvoices } from '@solargis/types/customer';
import { Company, User, UserCompany, UserCompanyRole, UserCompanyStatus } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { downloadBinaryFile, MimeType } from 'ng-shared/shared/utils/download.utils';

export const checkResponseSuccess = <T>(): OperatorFunction<T, T> =>
  map<T, T>(result => {
    if (result) {
      return result;
    }
    throw new Error();
  });

export const materialSortToSort = (matSort: MaterialSort): Sort =>
  removeEmpty({
    sortBy: !isEmpty(matSort?.direction) ? matSort.active.replace(/_/g, '.') : null,
    direction: matSort?.direction || null
  });

export const toFilterValue = (value: string, minLength: number = 3): string => {
  const trimmedValue = value?.trim();
  if (isEmpty(trimmedValue) || value.length < minLength) {
    return null;
  }
  return trimmedValue;
};

const toDateFilterValues = <T>({
  start, end
}: { start: Moment; end: Moment}, mapper: (moment: Moment) => T): [T, T] | null => isNil(start) || isNil(end)
    ? null
    : [mapper(start?.startOf('day')), mapper(end?.endOf('day'))];

export const toTimestampFilterValues = (value: { start: Moment; end: Moment }): NumberTuple =>
  toDateFilterValues(value, momentValue => momentValue?.valueOf());

export const toISO8601FilterValues = (value: { start: Moment; end: Moment }): StringTuple =>
  toDateFilterValues(value, momentValue => momentValue?.toISOString());

export const fromDateFilterValues = (
  value: StringTuple | NumberTuple
): { start: Moment | undefined; end: Moment | undefined } => ({
    start: isNil(value?.[0]) ? null : moment(value[0]),
    end: isNil(value?.[1]) ? null : moment(value[1])
  });

export const wrapInParenthesesIfNotEmpty = (value: string): string => (value ? ` (${value})` : '');

export const isCompanyAdmin = (user: UserCompany): boolean => user.status === 'ACTIVE' && user.role === 'ADMIN';
export const getActiveAdminsCount = (company: Company): number => (company.users ?? []).filter(isCompanyAdmin).length;
export const findCompanyUserById = (company: Company, sgAccountId: string): UserCompany =>
  company.users.find(user => user.sgAccountId === sgAccountId);
export const getUserRoleInCompany = (company: Company, user: User): UserCompanyRole => findCompanyUserById(company, user.sgAccountId)?.role;
export const getUserStatusInCompany = (company: Company, user: User): UserCompanyStatus =>
  findCompanyUserById(company, user.sgAccountId)?.status;

export const xslxExport = <T>({ http, url, label, request, columns }: {
  request: T; http: HttpClient; url: string; label: string; columns?: string[];
}): Observable<void> => http.put(
    url,
    request,
    {
      params: columns ? { columns: columns.join(',') } : {},
      responseType: 'arraybuffer',
      headers: { accept: MimeType.XLSX }
    }
  ).pipe(
    map(file => {
      downloadBinaryFile(
        file,
        `Solargis_${label}_${moment(new Date()).format('yyyy_MM_DD')}.xlsx`,
        MimeType.XLSX
      );
    })
  );

export const ensureNotEmpty = (value: string): string | null => isEmpty(value) ? null : value;

export const ensureNotEmptyObject = <T>(value: T): T | null =>
  isNil(value) || Object.keys(value).every(key => value[key] == null) ? null : value;

export const getOrderPriceWithoutVat = (order: OrderWithoutInvoices): number => order.price / (1 + (order.VAT_ID ?? 0) / 100);
