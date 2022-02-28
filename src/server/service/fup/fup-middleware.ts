import { FORBIDDEN } from 'http-status-codes';
import { forkJoin } from 'rxjs';

import { Response } from 'ng-shared/utils/response';

import { injector } from '../../injector';
import { checkCaptcha } from '../../router/middlewares/captcha.middleware';
import { resolveRemoteIP } from '../../util/middleware.utils';
import { FUPDataItem } from './data/dto/fup-data-item';
import { FupRuleResult } from './data/dto/fup-rule-result';
import { FUPDataServiceInterface, fupDataServiceToken } from './data/fup-data.service';
import { FUPLogger } from './fup-logger';
import { FUPAnonymousRule } from './rules/fup-anonymous-user-rule';
import { FUPLoggedUserRule } from './rules/fup-logged-user-rule';
import { FUPRule } from './rules/fup-rule';
import { FUPSpecificUserRule } from './rules/fup-specific-user-rule';

/**
 * List of supported FUP configuration types
 */
export type FUPConfigType = 'FUP-ANONYMOUS-RULE' | 'FUP-LOGGED-USER-RULE' | 'FUP-SPECIFIC-USER-RULE';
export interface FUPMiddlewareConfigItem {
  type: FUPConfigType;
  config: string;
}

/**
 * FUP middleware, read this
 * https://wiki.solargis.com/pages/viewpage.action?pageId=24315842
 * for more info (also other classes in this module contains helpful comments).
 *
 * @param resourceName
 * @param rulesConfiguration
 * @param PARALLEL - should be rules executed parallel ?
 * @returns
 * @constructor
 */

export function fupMiddleware(
  resourceName: string,
  rulesConfiguration: Array<FUPMiddlewareConfigItem>,
  PARALLEL = true
): (req: any, res: any, next: () => void) => void {
  // inject service
  const fupDataService: FUPDataServiceInterface = injector.get(fupDataServiceToken);

  // parse rules config
  const rules: Array<FUPRule> = [];
  for (const rule of rulesConfiguration) {
    switch (rule.type) {
      case 'FUP-ANONYMOUS-RULE': {
        rules.push(new FUPAnonymousRule(rule.config));
        break;
      }
      case 'FUP-LOGGED-USER-RULE': {
        rules.push(new FUPLoggedUserRule(rule.config));
        break;
      }
      case 'FUP-SPECIFIC-USER-RULE': {
        rules.push(new FUPSpecificUserRule(rule.config));
        break;
      }
    }
  }

  /**
   * Serial rules execution.
   * Rules are executed and evaluated one by one.
   *
   * @param rulesToValidate
   * @param fupDataItem
   * @param ruleToApply
   * @param start
   * @param res
   * @param next
   */
  function serialExecution(
    rulesToValidate: Array<FUPRule>,
    fupDataItem: FUPDataItem,
    ruleToApply: number,
    start: number,
    res: any,
    next: () => void): void {
    // check if rule number is valid
    if (ruleToApply >= 0 && ruleToApply < rulesToValidate.length) {
      const rule = rulesToValidate[ruleToApply];
      // execute rule
      rule.execute(fupDataItem).subscribe(result => {
        // evaluate rule
        if (result === FupRuleResult.DENY) {
          // rule was denied, log into DB, send error and stop execution
          const denyResult: Response = {
            status: false,
            code: 'fup_deny'
          };
          res.status(FORBIDDEN).json(denyResult);

          fupDataService.saveData(fupDataItem).subscribe(() => {
            FUPLogger.middlewareStop(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName, FupRuleResult.DENY, start);
          });
        } else if (result === FupRuleResult.ALLOW) {
          // rule was allowed, log into DB and move to next middlewares / service execution
          fupDataItem.allow();
          fupDataService.saveData(fupDataItem).subscribe(() => {
            FUPLogger.middlewareStop(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName, FupRuleResult.ALLOW, start);

            next();
          });
        } else {
          // do nothing, move to next rule ...
          return serialExecution(rulesToValidate, fupDataItem, ruleToApply + 1, start, res, next);
        }
      });
    } else {
      // this should not happen
      FUPLogger.middlewareError(
        fupDataItem.sub,
        fupDataItem.ip,
        fupDataItem.resName,
        start,
        `serial execution error, try to execute rule no. ${ruleToApply}|${rulesToValidate.length}`
      );
    }
  }

  /**
   * Parallel rule execution.
   * Each rule start execution, than forkJoin operator wait till all of them finish, than they are evaluated.
   *
   * @param rulesToValidate
   * @param fupDataItem
   * @param start
   * @param res
   * @param next
   */
  function parallelExecution(
    rulesToValidate: Array<FUPRule>,
    fupDataItem: FUPDataItem,
    start: number,
    res: any,
    next: () => void
  ): void {
    const rules$ = [];
    for (const rule of rulesToValidate) {
      rules$.push(rule.execute(fupDataItem));
    }

    forkJoin(rules$).subscribe(results => {
      // forkJoin preserve orders of observables <=> results
      let allowed = true;

      for (const result of results) {
        if (result === FupRuleResult.DENY) {
          const denyResult: Response = {
            status: false,
            code: 'fup_deny'
          };
          res.status(FORBIDDEN).json(denyResult);
          allowed = false;
          // skip foreach
          break;
        } else if (result === FupRuleResult.ALLOW) {
          // skip foreach
          break;
        } else {
          // do nothing, move to next rule ...
        }
      }

      // 2) save usage as allowed
      if (allowed) {
        fupDataItem.allow();
        fupDataService.saveData(fupDataItem).subscribe(() => {
          FUPLogger.middlewareStop(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName, FupRuleResult.ALLOW, start);

          next();
        });
      } else {
        fupDataService.saveData(fupDataItem).subscribe(() => {
          FUPLogger.middlewareStop(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName, FupRuleResult.DENY, start);
        });
      }
    });
  }

  return function(req, res, next) {
    const start = Date.now();

    const fupDataItem = new FUPDataItem(
      resolveRemoteIP(req, true),
      req.headers['user-agent'],
      (req.user != null) ? req.user : null,
      resourceName
    );

    FUPLogger.middlewareStart(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName);

    // 1a) check recaptcha
    if (req.query.captcha) {
      const captcha = JSON.parse(req.query.captcha);
      // validate recaptcha
      const result: Response = {
        status: false,
        code: null
      };
      checkCaptcha(captcha, req.headers['device-type']).subscribe(recaptchaCheckResult => {
        if (recaptchaCheckResult) {
          FUPLogger.middlewareStop(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName, FupRuleResult.ALLOW, start);
          next();
        } else {
          FUPLogger.middlewareStop(fupDataItem.sub, fupDataItem.ip, fupDataItem.resName, FupRuleResult.DENY, start);
          result.code = 'captcha_not_valid';
          res.status(FORBIDDEN).json(result);
        }
      });
    } else {
      // 1b) check allow/deny for each rule
      if (PARALLEL) {
        parallelExecution(rules, fupDataItem, start, res, next);
      } else {
        serialExecution(rules, fupDataItem, 0, start, res, next);
      }
    }
  };
}
