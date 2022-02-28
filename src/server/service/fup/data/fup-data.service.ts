import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { FUPDataItem } from './dto/fup-data-item';
import { FUPError } from './dto/fup-error';

/**
 * Interface for service which provide access to storage of all requests for protected resources
 */
export interface FUPDataServiceInterface {

  /**
   * Save new request for protected resource into storage
   */
  saveData(item: FUPDataItem): Observable<boolean>;

  /**
   * Get requests for protected resource by ip and resource name.
   * Returned are only requests 'older' than ts - from.
   */
  getByIP(readConsistency: boolean, resourceName: string, ip: string, from: number): Observable<Array<FUPDataItem>|FUPError>;

  /**
   * Get requests for protected resource by sub and resource name.
   * Returned are only requests 'older' than ts - from.
   */
  getByUserId(readConsistency: boolean, resourceName: string, userId: string, from: number): Observable<Array<FUPDataItem>|FUPError>;
}

export const fupDataServiceToken = new InjectionToken<FUPDataServiceInterface>('FupDataService');

export * from './fup-data-impl.service';
