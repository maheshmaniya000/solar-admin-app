import * as winston from 'winston';

import { fupOpts } from '../../env';
import { FupRuleResult } from './data/dto/fup-rule-result';
import { FUPRule } from './rules/fup-rule';

export class FUPLogger {

  static OFF = 'OFF';
  static INFO = 'INFO';
  static DEBUG = 'DEBUG';

  /**
   * Start of rule
   *
   * @param rule
   * @param id
   */
  static start(
    rule: FUPRule,
    id: string
  ): void {
    if (fupOpts.level === FUPLogger.DEBUG) {
      const logMsg = {
        RULE: rule.type,
        ID: id
      };
      winston.loggers.get('fup').info('fup_rule_start', logMsg);
    }
  }

  /**
   * End of rule
   *
   * @param rule
   * @param result
   * @param id
   * @param start
   * @param usedCount
   * @param allowedCount
   */
  static end(
    rule: FUPRule,
    result: FupRuleResult,
    id: string,
    start: number,
    usedCount: number,
    allowedCount: number
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        RULE: rule.type,
        ID: id,
        DURATION: duration,
        RESULT: result,
        USED_COUNT: usedCount,
        ALLOWED_COUNT: allowedCount
      };
      winston.loggers.get('fup').info('fup_rule_end', logMsg);
    }
  }

  /**
   * End of rule without data - error happen
   *
   * @param rule
   * @param result
   * @param id
   * @param start
   */
  static endNoData(
    rule: FUPRule,
    result: FupRuleResult,
    id: string,
    start: number
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        RULE: rule.type,
        ID: id,
        DURATION: duration,
        RESULT: result
      };
      winston.loggers.get('fup').info('fup_rule_no_data', logMsg);
    }
  }

  /**
   * End of rule with error
   *
   * @param rule
   * @param msg
   * @param id
   * @param start
   */
  static error(
    rule: FUPRule,
    id: string,
    start: number,
    msg: string
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        RULE: rule.type,
        ID: id,
        DURATION: duration,
        RESULT: 'error',
        MSG: msg
      };
      winston.loggers.get('fup').info('fup_rule_error', logMsg);
    }
  }

  /**
   * FUP started
   *
   * @param sub
   * @param ip
   * @param resource
   */
  static middlewareStart(
    sub: string,
    ip: string,
    resource: string
  ): void {
    if (fupOpts.level === FUPLogger.DEBUG) {
      const logMsg = {
        SUB: sub,
        IP: ip,
        RESOURCE: resource,
      };
      winston.loggers.get('fup').info('fup_middleware_start', logMsg);
    }
  }

  /**
   * FUP end - with result.
   *
   * @param sub
   * @param ip
   * @param resource
   * @param result
   * @param start
   */
  static middlewareStop(
    sub: string,
    ip: string,
    resource: string,
    result: FupRuleResult,
    start: number
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        SUB: sub,
        IP: ip,
        RESOURCE: resource,
        DURATION: duration,
        RESULT: result
      };
      winston.loggers.get('fup').info('fup_middleware_end', logMsg);
    }
  }

  /**
   * FUP end - with error
   *
   * @param sub
   * @param ip
   * @param resource
   * @param start
   * @param msg
   */
  static middlewareError(
    sub: string,
    ip: string,
    resource: string,
    start: number,
    msg: string
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        SUB: sub,
        IP: ip,
        RESOURCE: resource,
        DURATION: duration,
        RESULT: 'error',
        MSG: msg
      };
      winston.loggers.get('fup').info('fup_middleware_error', logMsg);
    }
  }

  /**
   * FUP data query start
   *
   * @param operation
   * @param id
   */
  static dataStart(
    operation: string,
    id: string
  ): void {
    if (fupOpts.level === FUPLogger.DEBUG) {
      const logMsg = {
        OPERATION: operation,
        ID: id
      };
      winston.loggers.get('fup').info('fup_data_service_start', logMsg);
    }
  }

  /**
   * FUP data query stop
   *
   * @param operation
   * @param id
   * @param start
   */
  static dataStop(
    operation: string,
    id: string,
    start: number
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        OPERATION: operation,
        ID: id,
        DURATION: duration,
        RESULT: 'OK'
      };
      winston.loggers.get('fup').info('fup_data_service_end', logMsg);
    }
  }

  /**
   * FUP data query stoped with error
   *
   * @param operation
   * @param id
   * @param start
   * @param error
   */
  static dataError(
    operation: string,
    id: string,
    start: number,
    error: string
  ): void {
    if (fupOpts.level !== FUPLogger.OFF) {
      const duration = Date.now() - start;
      const logMsg = {
        OPERATION: operation,
        ID: id,
        DURATION: duration,
        RESULT: 'error',
        MSG: error
      };
      winston.loggers.get('fup').info('fup_data_service_error', logMsg);
    }
  }
}
