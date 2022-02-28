import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { FUPDataItem } from '../data/dto/fup-data-item';
import { FupRuleResult } from '../data/dto/fup-rule-result';
import { getFUPStaticConfig } from '../data/fup-config-manager';
import { FUPConfigException } from '../exception/fup-config-exception';
import { FUPLogger } from '../fup-logger';
import { FUPRule } from './fup-rule';

export interface FUPAnonymousRuleConfig {
  interval: number;
  count: number;
}

/**
 * This rule is used to protect resource by IP
 */
export class FUPAnonymousRule extends FUPRule {

  readonly type = 'FUP-ANONYMOUS-RULE';

  execute(fupDataItem: FUPDataItem): Observable<FupRuleResult> {
    const start = Date.now();
    FUPLogger.start(this, `${fupDataItem.resName}|${fupDataItem.ip}`);

    // get config + parse it
    try {
      const config = this.parseConfig(getFUPStaticConfig(this.config));

      // get fup data
      return this.fupDataService.getByIP(
        this.readConsistency,
        fupDataItem.resName,
        fupDataItem.ip,
        Date.now() - config.interval * 1000
      ).pipe(
        map(data => {
          // evaluate
          if (data instanceof Array) {
            if (data.length > config.count) {
              FUPLogger.end(
                this,
                FupRuleResult.DENY,
                `${fupDataItem.resName}|${fupDataItem.ip}`,
                start,
                data.length,
                config.count
              );

              return FupRuleResult.DENY;
            } else {
              FUPLogger.end(
                this,
                FupRuleResult.ALLOW,
                `${fupDataItem.resName}|${fupDataItem.ip}`,
                start,
                data.length,
                config.count
              );

              return FupRuleResult.ALLOW;
            }
          } else {
            FUPLogger.endNoData(
              this,
              FupRuleResult.DENY,
              `${fupDataItem.resName}|${fupDataItem.ip}`,
              start
            );

            return FupRuleResult.DENY;
          }
        })
      );
    } catch (e) { // FIXME probably should be handled by catchError operator
      FUPLogger.error(
        this,
        `${fupDataItem.resName}|${fupDataItem.ip}`,
        start,
        e.message
      );
      return of(FupRuleResult.DENY);
    }
  }

  parseConfig(configRaw: JSON): FUPAnonymousRuleConfig {
    if (typeof configRaw  === 'string') {
      const configParsing = (configRaw as string).split('-');
      if (configParsing.length === 2) {


        if (isNaN(parseInt(configParsing[0], 10)) || isNaN(parseInt(configParsing[1], 10))) {
          throw new FUPConfigException(
            this,
            this.config,
            configRaw,
            FUPConfigException.BAD_INTERVAL_NUMBER_FORMAT
          );
        }

        return {
          interval: parseInt(configParsing[0], 10),
          count: parseInt(configParsing[1], 10)
        };
      } else {
        throw new FUPConfigException(
          this,
          this.config,
          configRaw,
          FUPConfigException.BAD_INTERVAL_FORMAT
        );
      }
    }

    throw new FUPConfigException(
      this,
      this.config,
      configRaw,
      FUPConfigException.CONFIG_NOT_STRING
    );
  }

}
