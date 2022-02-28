import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { auth0Opts } from '../../../env';
import { FUPDataItem } from '../data/dto/fup-data-item';
import { FupRuleResult } from '../data/dto/fup-rule-result';
import { FUPConfigException } from '../exception/fup-config-exception';
import { FUPLogger } from '../fup-logger';
import { FUPRule } from './fup-rule';

/**
 * Rule similar to FUPLoggedUserRule - protect resource by UserId - for all logged user BUT this rule in config require specific
 * settings for users.
 *
 * Required is JWT token in request - while sub is 'sub' from JWT token.
 * If JWT token is not present, returned is UNKNOWN result.
 * If user has no specific rules or no specific rules for this configuration, returned is UNKNOWN.
 *
 * In rule interval can be as count used "NOFUP" - than user has NO FUP settings - return ALLOW.
 */
export class FUPSpecificUserRule extends FUPRule {

  private static readonly NO_FUP = 'NOFUP';

  readonly type = 'FUP-SPECIFIC-USER-RULE';

  execute(fupDataItem: FUPDataItem): Observable<FupRuleResult> {
    const start = Date.now();
    FUPLogger.start(this, `${fupDataItem.resName}|${fupDataItem.sub}`);

    if (!fupDataItem.sub) {
      // unknown
      FUPLogger.endNoData(
        this,
        FupRuleResult.UNKNOWN,
        `${fupDataItem.resName}|${fupDataItem.sub}`,
        start
      );

      return of(FupRuleResult.UNKNOWN);
    }

    // get config + parse it
    try {
      let config = null;
      const sgClaims = fupDataItem.userJwt[auth0Opts.customNamespace];
      if (sgClaims && sgClaims.app_metadata) {
        const fupSg2ConfigForUser = sgClaims.app_metadata['fup-sg2-configuration'];
        if (fupSg2ConfigForUser && fupSg2ConfigForUser[this.config]) {
          config = this.parseConfig(fupSg2ConfigForUser[this.config]);
        }
      }

      if (!config) {
        // unknown, user has no specific configuration or no specific configuration for configuration
        FUPLogger.endNoData(
          this,
          FupRuleResult.UNKNOWN,
          `${fupDataItem.resName}|${fupDataItem.sub}`,
          start
        );

        return of(FupRuleResult.UNKNOWN);
      }

      if (config === FUPSpecificUserRule.NO_FUP) {
        console.log('NOFUP');
        FUPLogger.endNoData(
          this,
          FupRuleResult.ALLOW,
          `${fupDataItem.resName}|${fupDataItem.sub}`,
          start
        );
        return of(FupRuleResult.ALLOW);
      }

      // get fup data
      return this.fupDataService.getByUserId(
        this.readConsistency,
        fupDataItem.resName,
        fupDataItem.sub,
        Date.now() - config.interval * 1000
      ).pipe(
        map(data => {
          // evaluate
          if (data instanceof Array) {
            if (data.length > parseInt(config.count, 10)) {
              FUPLogger.end(
                this,
                FupRuleResult.DENY,
                `${fupDataItem.resName}|${fupDataItem.sub}`,
                start,
                data.length,
                parseInt(config.count, 10)
              );

              return FupRuleResult.DENY;
            } else {
              FUPLogger.end(
                this,
                FupRuleResult.ALLOW,
                `${fupDataItem.resName}|${fupDataItem.sub}`,
                start,
                data.length,
                parseInt(config.count, 10)
              );

              return FupRuleResult.ALLOW;
            }
          } else {
            FUPLogger.endNoData(
              this,
              FupRuleResult.DENY,
              `${fupDataItem.resName}|${fupDataItem.sub}`,
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

  parseConfig(configRaw: JSON): 'NOFUP' | { interval: number; count: string } {
    if (typeof configRaw  === 'string') {
      if (configRaw === FUPSpecificUserRule.NO_FUP) {
        return FUPSpecificUserRule.NO_FUP;
      }

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
          count: configParsing[1]
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
