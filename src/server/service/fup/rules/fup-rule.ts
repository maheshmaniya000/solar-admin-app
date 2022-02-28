import { Observable } from 'rxjs';

import { injector } from '../../../injector';
import { FUPDataItem } from '../data/dto/fup-data-item';
import { FupRuleResult } from '../data/dto/fup-rule-result';
import { FUPDataServiceInterface, fupDataServiceToken } from '../data/fup-data.service';
import { FUPConfigType } from '../fup-middleware';

/**
 * Each FUP rule must implement this class.
 *
 */
export abstract class FUPRule {

  readonly type: FUPConfigType;

  config: string; // name of config for rule
  readConsistency: boolean;

  fupDataService: FUPDataServiceInterface = injector.get(fupDataServiceToken);

  constructor(config: string, readConsistency = false) {
    this.config = config;
    this.readConsistency = readConsistency;
  }

  /**
   * Execute rule and return result
   *
   * @param {FUPDataItem} fupDataItem
   * @returns {Observable<FupRuleResult>}
   */
  abstract execute(fupDataItem: FUPDataItem): Observable<FupRuleResult>;

  /**
   * Parse config into usable format - also validate config.
   *
   * @param {JSON} configRaw
   */
  abstract parseConfig(configRaw: JSON);
}
