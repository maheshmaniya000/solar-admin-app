import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, publishReplay, refCount, switchMap } from 'rxjs/operators';

import { CaptchaResult } from '@solargis/types/captcha';
import { getVatIdPrefix, VatCompanyRef, VatCountryRef } from '@solargis/types/customer';
import {
  Company,
  CompanyInvitationDetail,
  CompanyInvitationListItem,
  CompanyInvitationRequest,
  CompanyWithToken,
  Country,
  SolargisApp,
  UpdateUserCompanyOpts,
  UserCompany,
  UserCompanyDetails,
  UserCompanyStatus
} from '@solargis/types/user-company';
import { isEmpty } from '@solargis/types/utils';

import { Config } from '../../config';
import { FUPHttpClientService } from '../../fup/services/fup-http-client.service';
import { CompanyId } from '../types';


@Injectable({ providedIn: 'root' })
export class CompanyService {

  countries$: Observable<Country[]>;

  constructor(private readonly http: FUPHttpClientService, private readonly config: Config) {
    this.countries$ = of(true).pipe(
      switchMap(() => this.http.get(`${this.config.api.customerUrl}/country`)),
      publishReplay(1),
      refCount()
    );
  }

  /**
   * Load all companies for logged user
   */
  listCompanies(): Observable<CompanyWithToken[]> {
    return this.http.get(this.getListCompaniesApiUrl());
  }

  getListCompaniesApiUrl(): string {
    return `${this.config.api.customerUrl}/user/me/company`; // FIXME me? - I can resolve my id, can't I?
  }

  /**
   * Load single company by company ID
   */
  loadCompany(sgCompanyId: CompanyId): Observable<CompanyWithToken> {
    return this.http.get(`${this.config.api.customerUrl}/company/${encodeURIComponent(sgCompanyId)}`);
  }

  /**
   * Create a new company
   */
  createCompany(company: Partial<Company>): Observable<CompanyWithToken> {
    return this.http.post(`${this.config.api.customerUrl}/company`, company) as Observable<CompanyWithToken>;
  }

  /**
   * Create or update company
   */
  updateCompany(sgCompanyId: string, company: Partial<Company>): Observable<CompanyWithToken> {
    return this.http.patch(`${this.config.api.customerUrl}/company/${sgCompanyId}`, company) as Observable<CompanyWithToken>;
  }

  /**
   * Assign free trial for specified Solargis app to a company
   */
  assignProspectFreeTrial(company: Company, phoneNumber: string, otpCode: string ): Observable<CompanyWithToken> {
    return this.http.post(
      `${this.config.api.customerUrl}/company/${encodeURIComponent(company.sgCompanyId)}/app/prospect/freetrial`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      { phoneNumber, OTPCode: otpCode }
    ).pipe(
      map((cwt: CompanyWithToken) => cwt), // FIXME no CompanyWithToken type ?
      catchError(res => throwError(res.error || res.message || res))
    );
  }

  /**
   * List full user objects for a company
   */
  listUsersForCompany(sgCompanyId: string): Observable<UserCompanyDetails[]> {
    return sgCompanyId
      ? this.http.get(`${this.config.api.customerUrl}/company/${sgCompanyId}/users`)
      : of([]);
  }

  listUsersForCompanyByStatus(sgCompanyId: string, ...statuses: UserCompanyStatus[]): Observable<UserCompanyDetails[]> {
    return this.listUsersForCompany(sgCompanyId).pipe(map(users => users.filter(user => statuses.includes(user.status))));
  }

  /**
   * Create a request to assign user to a company
   */
  inviteUserToCompany(company: Company, email: string, addToSubscription: boolean | SolargisApp[] = true): Observable<any> {
    const req: CompanyInvitationRequest = { email, addToSubscription };
    return this.http.put(`${this.config.api.customerUrl}/company/${company.sgCompanyId}/invitation`, req);
  }

  /**
   * Returns company invitation info
   */
  getCompanyInvitationInfo(id: string): Observable<CompanyInvitationDetail> {
    return this.http.get(`${this.config.api.customerUrl}/company-invitation/${id}`);
  }
  /**
   * Accepts AssignUserToCompanyRequest by id.
   * Requires user to be logged in
   */
  acceptCompanyInvitation(id: string): Observable<CompanyWithToken> {
    return this.http.post(`${this.config.api.customerUrl}/company-invitation/${id}/accept`).pipe(
      map((response: CompanyWithToken) => response),
    );
  }

  /**
   * Update user role and status in a company
   * Returns the same as listUsersForCompany
   */
  updateUserInCompany(company: Company, user: UserCompany, req: UpdateUserCompanyOpts): Observable<UserCompanyDetails[]> {
    return this.http.patch(
      `${this.config.api.customerUrl}/company/${company.sgCompanyId}/users/${user.sgAccountId}`,
      req
    ) as Observable<UserCompanyDetails[]>;
  }

  /**
   * Update user role and status in a company
   * Returns the same as listUsersForCompany
   */
  deleteUserFromCompany(company: Company, user: UserCompany): Observable<UserCompanyDetails[]> {
    return this.http.delete(
      `${this.config.api.customerUrl}/company/${company.sgCompanyId}/users/${user.sgAccountId}`
      ) as Observable<UserCompanyDetails[]>;
    }

  /**
   * List valid company invitations
   */
  listCompanyInvitations(company: Company): Observable<CompanyInvitationListItem[]> {
    return this.http.get(`${this.config.api.customerUrl}/company/${company.sgCompanyId}/invitation`);
  }

  /**
   * Send email to admins to review request for SG2 license if I already have iMaps/SG1
   */
  requestLicenseFromSG1(company: Company): Observable<any> {
    return this.http.post(`${this.config.api.customerUrl}/company/${company.sgCompanyId}/request-sg1-license`);
  }

  validateVatId(companyOrCountry: VatCompanyRef & VatCountryRef, vatId: string): Observable<boolean> {
    const vatIdPrefix = getVatIdPrefix(companyOrCountry);
    if (vatIdPrefix && vatId && vatId.startsWith(vatIdPrefix)) {
      return this.http.get(`${this.config.api.customerUrl}/company-validate/vat-id/${vatId}`);
    } else {
      return of(false);
    }
  }

  listCountries(): Observable<Country[]> {
    return this.countries$;
  }

  findCountryByCode(code: string): Observable<Country | undefined> {
    return this.countries$.pipe(map(countries => countries.find(country => country.code === code)));
  }

  findCountries(name?: string): Observable<Country[]> {
    return isEmpty(name)
      ? this.countries$
      : this.countries$.pipe(
        map((countries: Country[]) =>
          countries.filter(
            country => typeof name === 'string' && country.name.toLowerCase().includes(name.toLowerCase())
          )
        )
      );
  }

  /**
   * Generates OTP for free trial request
   */
  generateOTP(phone: string, captcha: CaptchaResult): Observable<any> {
    return this.http.post(`${this.config.api.customerUrl}/auth/generate-otp`, { phone, captcha });
  }

}
