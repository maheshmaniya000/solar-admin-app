import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APIContract, APIContractFull } from '@solargis/types/api/contract';

import { Config } from 'ng-shared/config';

/**
 * Service providing API for admin orders API
 */
@Injectable({
  providedIn: 'root'
})
export class AdminApiContractsService {

  apiResource = 'ws';

  constructor(
    private readonly http: HttpClient,
    private readonly config: Config
  ) {}

  /**
   * List API contracts for companies
   */
  listAPIContracts(sgCompanyId: string): Observable<APIContract[]> {
    return this.http.get<APIContract[]>(`${this.config.api.baseUrl}/${this.apiResource}/contract/` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
    );
  }

  /**
   * Create API contract for company if 'id' propery is not set.
   * Update API contract for company if 'id' propesty is set.
   */
  upsertAPIContract(sgCompanyId: string, apIContract: APIContract): Observable<APIContract> {
    if (apIContract.id) {
      return this.http.put<APIContract>(
        `${this.config.api.baseUrl}/${this.apiResource}/contract/?sgCompanyId=${encodeURIComponent(sgCompanyId)}`,
        apIContract
      );
    } else {
      return this.http.post<APIContract>(
        `${this.config.api.baseUrl}/${this.apiResource}/contract/?sgCompanyId=${encodeURIComponent(sgCompanyId)}`,
        apIContract
      );
    }
  }

  /**
   * Delete existing API contract for company.
   */
  deleteAPIContracts(sgCompanyId: string, apiContractId: string): Observable<APIContract> {
    return this.http.delete<APIContract>(
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
    );
  }

  /**
   * Get single existing API contract for company  (with access tokens and statistics).
   */
  getAPIContracts(sgCompanyId: string, apiContractId: string): Observable<APIContractFull> {
    return this.http.get<APIContractFull>(
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
    );
  }

  /**
   * Generate new API token (access key) for API contract.
   */
  generateNewToken(sgCompanyId: string, apiContractId: string): Observable<string> {
    return this.http.put(
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}/token` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
      , {})
      .pipe(
        map((response: any) => response.accessToken)
      );
  }

  /**
   * Revoke existing API token (access key) for API contract.
   */
  revokeToken(sgCompanyId: string, apiContractId: string, token: string): Observable<boolean> {
    return this.http.request('delete',
      `${this.config.api.baseUrl}/${this.apiResource}/contract/${encodeURIComponent(apiContractId)}/token` +
      `?sgCompanyId=${encodeURIComponent(sgCompanyId)}`
      , { body: [ token ] }).pipe(
      map((response: any) => response.status)
    );
  }
}
