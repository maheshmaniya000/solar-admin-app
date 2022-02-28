import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APIContract, APIContractFull } from '@solargis/types/api/contract';

import { Config } from 'ng-shared/config';

/**
 * Service providing API for API Contracts
 */
@Injectable()
export class ApiContractsService {

  apiResource = 'ws';

  constructor(
    private readonly http: HttpClient,
    private readonly config: Config
  ) { }

  /**
   * List API contracts for companies
   *
   * @param sgCompanyId
   */
  listAPIContracts(sgCompanyId: string): Observable<APIContract[]> {
    return this.http.get<APIContract[]>(
      `${this.config.api.baseUrl}/${this.apiResource}/contract/?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
    );
  }

  /**
   * Get single existing API contract for company  (with access tokens and statistics).
   *
   * @param sgCompanyId
   * @param apiContractId
   */
  getAPIContracts(sgCompanyId: string, apiContractId: string): Observable<APIContractFull> {
    return this.http.get<APIContractFull>(
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
    );
  }

  /**
   * Generate new API token (access key) for API contract.
   *
   * @param sgCompanyId
   * @param apiContractId
   */
  generateNewToken(sgCompanyId: string, apiContractId: string): Observable<string> {
    return this.http.put<any>(
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}/token` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
      , {})
      .pipe(
        map(response => response.accessToken)
      );
  }

  /**
   * Revoke existing API token (access key) for API contract.
   *
   * @param sgCompanyId
   * @param apiContractId
   * @param token
   */
  revokeToken(sgCompanyId: string, apiContractId: string, token: string): Observable<boolean> {
    return this.http.request<any>('delete',
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}/token` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
      , { body: [ token ] }).pipe(
      map(response => response.status)
    );
  }
}
