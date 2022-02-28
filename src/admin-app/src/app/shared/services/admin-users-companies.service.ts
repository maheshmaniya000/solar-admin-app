import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { Page, Sort as ApiSort } from '@solargis/types/api';
import {
  Company,
  CompanyListFilter,
  CompanyListRequest,
  CompanyListResponse,
  CompanyWithToken,
  ProspectLicense,
  SDATSubscription,
  User,
  UserCompany,
  UserCompanyDetails,
  UserCompanyRole,
  UserCompanyStatus,
  UserListFilter,
  UserListRequest,
  UserListResponse
} from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { Config } from 'ng-shared/config';
import { MimeType } from 'ng-shared/shared/utils/download.utils';

import { xslxExport } from '../admin.utils';

/**
 * Service for listing/managing all companies / users (master db) - making rest call to SG2 API.
 *
 * TODO: split to AdminUsersService and AdminCompaniesService
 */
@Injectable({ providedIn: 'root' })
export class AdminUsersCompaniesService {
  constructor(private readonly config: Config, private readonly http: HttpClient) {}

  getUsers(filter: UserListFilter, page: Page, sort?: ApiSort): Observable<UserListResponse> {
    const request: UserListRequest = removeEmpty({ filter, page, sort: sort.sortBy ? sort : undefined }, true);
    // should be GET method, but we need to send body
    return this.http.put<UserListResponse>(`${this.config.api.customerUrl}/admin/user`, request);
  }

  getUser(sgAccountId: string, includeDeleted: boolean = true): Observable<User> {
    return this.http.get<User>(`${this.config.api.customerUrl}/admin/user/${sgAccountId}`,
      { params: new HttpParams().set('deleted', includeDeleted.toString()) }
    );
  }

  listUsersForCompany(sgCompanyId: string): Observable<UserCompanyDetails[]> {
    if (!sgCompanyId) {
      return of([]);
    } else {
      return this.http.get(`${this.config.api.customerUrl}/company/${sgCompanyId}/users`).pipe(
        map((res: UserCompanyDetails[]) => res),
        shareReplay()
      );
    }
  }

  downloadViesValidation(sgCompanyId: string, sgOrderId: string, current?: boolean, noSign?: boolean): Observable<any> {
    return this.http.get(
      `${this.config.api.customerUrl}/company/${sgCompanyId}/order/${sgOrderId}/vies-report`,
      {
        // @ts-ignore
        responseType: 'arraybuffer',
        headers: { accept: MimeType.PDF },
        // @ts-ignore
        params: removeEmpty({ noSign, current })
      }
    );
  }

  getCompanies(filter: CompanyListFilter, page: Page, sort?: ApiSort): Observable<CompanyListResponse> {
    const request: CompanyListRequest = removeEmpty({ filter, page, sort: sort?.sortBy ? sort : undefined }, true);
    // should be GET method, but we need to send body
    return this.http.put<CompanyListResponse>(`${this.config.api.customerUrl}/admin/company`, request);
  }

  exportCompaniesXlsx(filter: CompanyListFilter, sort?: ApiSort, selected?: string[]): Observable<void> {
    const request: CompanyListRequest = removeEmpty({ filter, sort: sort?.sortBy ? sort : undefined }, true);
    if (selected?.length) {
      request.filter.sgCompanyId = selected;
    }
    return xslxExport({
      request, http: this.http, url: `${this.config.api.customerUrl}/admin/export/company`, label: 'Companies'
    });
  }

  exportUsersXlsx(filter: UserListFilter, columns: string[], sort?: ApiSort, selected?: string[]): Observable<void> {
    const request: UserListRequest = removeEmpty({ filter, sort: sort?.sortBy ? sort : undefined }, true);
    if (selected?.length) {
      request.filter.sgAccountId = selected;
    }
    return xslxExport({
      request, http: this.http, url: `${this.config.api.customerUrl}/admin/export/user`, label: 'Users', columns
    });
  }

  getCompany(sgCompanyId: string, deleted?: boolean): Observable<Company> {
    const opts = typeof deleted !== 'undefined' ? { params: { deleted: ''+deleted }} : undefined;
    return this.http.get<Company>(`${this.config.api.customerUrl}/admin/company/${sgCompanyId}`, opts);
  }

  bulkChangeHistoric(sgCompanyIds: string[], historic?: boolean, parentSgCompanyId?: string): Observable<boolean> {
    const params = sgCompanyIds.map(sgCompanyId => [sgCompanyId, removeEmpty({ historic, parentSgCompanyId })]);
    return this.http.patch(`${this.config.api.customerUrl}/admin/company`, params).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  getChildCompanies(sgCompanyId: string): Observable<Company[]> {
    return this.http.get<Company[]>(
      `${this.config.api.customerUrl}/admin/company/${sgCompanyId}/child-companies`
    );
  }

  listCompaniesForUser(sgAccountId: string): Observable<Array<Company>> {
    return this.http
      .get<Array<CompanyWithToken>>(`${this.config.api.customerUrl}/user/${sgAccountId}/company`)
      .pipe(map(cwts => cwts?.map(cwt => cwt.company)));
  }

  updateUser(user: User): Observable<User> {
    // TODO: these hacks will be fixed in registration workflow https://solargis.atlassian.net/browse/SG2-5085
    // @ts-ignore
    if (user._id) { delete user._id; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sgAccountId, settings, selectedSgCompanyId, ...update } = user;
    return this.http
      .patch(`${this.config.api.customerUrl}/admin/user/${sgAccountId}`, removeEmpty(update, true, false))
      .pipe(
        map((res: User) => res),
        catchError(() => of(null))
      );
  }

  createUser(user: User): Observable<User> {
    user.inspected = true;
    return this.http.post<User>(`${this.config.api.customerUrl}/admin/user`, user);
  }

  updateCompany(sgCompanyId: string, company: Partial<Company>): Observable<CompanyWithToken> {
    return this.http.patch<CompanyWithToken>(`${this.config.api.customerUrl}/admin/company/${sgCompanyId}`, company);
  }

  deleteCompany(sgCompanyId: string, deleted: boolean): Observable<boolean> {
    return this.http
      .patch(`${this.config.api.customerUrl}/admin/company/${sgCompanyId}`, { deleted })
      .pipe(map(() => true));
  }

  createCompany(company: Company): Observable<CompanyWithToken> {
    company.inspected = true;
    return this.http.post<CompanyWithToken>(`${this.config.api.customerUrl}/admin/company`, company);
  }

  deleteUserFromCompany(sgAccountId: string, sgCompanyId: string): Observable<boolean> {
    return this.http
      .delete(`${this.config.api.customerUrl}/company/${sgCompanyId}/users/${sgAccountId}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  assignUserToCompany(
    sgAccountId: string,
    sgCompanyId: string,
    role: UserCompanyRole,
    status: UserCompanyStatus
  ): Observable<boolean> {
    const userCompany: UserCompany = { sgAccountId, role, status };
    return this.http
      .post(`${this.config.api.customerUrl}/admin/company/${sgCompanyId}/users`, userCompany)
      .pipe(map((res: any) => !!res));
  }

  editUserInCompany(
    sgAccountId: string,
    sgCompanyId: string,
    role: UserCompanyRole,
    status: UserCompanyStatus
  ): Observable<boolean> {
    return this.http
      .patch(`${this.config.api.customerUrl}/company/${sgCompanyId}/users/${sgAccountId}`, { role, status })
      .pipe(map((res: any) => !!res));
  }

  assignSubCompaniesUsersToParentCompany( sgCompanyId: string): Observable<boolean> {
    return this.http
      .post(`${this.config.api.customerUrl}/admin/company/${sgCompanyId}/assign-users-from-child-companies`, {})
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  saveAppSubscription(
    company: Company,
    app: 'prospect' | 'sdat',
    subscription: ProspectLicense | SDATSubscription
  ): Observable<Company> {
    return this.http.put<Company>(
      `${this.config.api.customerUrl}/admin/company/${company.sgCompanyId}/app/${app}/subscription`,
      subscription
    );
  }

  saveTMYSubscription(
    company: Company
  ): Observable<Company> {
    return of(company);
  }

  getTMYSubscription(): Observable<any> {
    const data = [
      { id: 1, subscriptionType: 'TMY BASIC', status: 'Active', calls: 30, remainingCalls: 25,
      startDate: new Date('2021-07-05T01:10:00Z'), expiryDate: new Date('2021-07-12T01:10:00Z'), details: 'Edit' },

      { id: 2, subscriptionType: 'TMY PRO', status: 'Active', calls: 30, remainingCalls: 20,
      startDate: new Date('2021-07-01T01:10:00Z'), expiryDate: new Date('2021-07-11T01:10:00Z'), details: 'Edit' },

      { id: 3, subscriptionType: 'TMY BASIC', status: 'Inactive', calls: 30, remainingCalls: 25,
      startDate: new Date('2021-07-01T01:10:00Z'), expiryDate: new Date('2021-07-10T01:10:00Z'), details: 'Edit' },
    ];
    return of(data);
  }

  deleteAppSubscription(company: Company, app: 'prospect' | 'sdat'): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.config.api.customerUrl}/admin/company/${company.sgCompanyId}/app/${app}/subscription`
    );
  }

  getUserTokens(): Observable<any> {
    const data = [
      { id: 1, email:'test@gmail.com', tokenId: 'sif98jsdfjds98fjsd9f9ds8f9s8djf98jsd98fjsd9f',
      generationDate: '1.11.2021 12.12.24' },
      { id: 2,email:'test@gmail.com', tokenId: 'sif98jsdfjds98fjsd9f9ds8f9s8djf98jsd98fjsd9f',
      generationDate: '1.11.2021 12.12.24' },
      { id: 3,email:'test@gmail.com', tokenId: 'sif98jsdfjds98fjsd9f9ds8f9s8djf98jsd98fjsd9f',
      generationDate: '1.11.2021 12.12.24' }
    ];
    return of(data);
  }
}
