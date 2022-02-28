import { FUPRule } from '../rules/fup-rule';

/**
 * Exception when FUP cannot parse configuration
 *
 */
export class FUPConfigException extends Error {

  static CONFIG_NOT_STRING = 'Config is not string';
  static BAD_INTERVAL_FORMAT = 'Bad interval format, should be: [SECONDS]-[COUNT]';
  static BAD_INTERVAL_NUMBER_FORMAT = 'Interval must contains two numbers: [NUMBER]-[NUMBER]';

  constructor(
    rule: FUPRule,
    configName: string,
    configuration: JSON,
    error: string
  ) {
    super(`Configuration ${configName} (${JSON.stringify(configuration)}) for ${rule.type} cannot be parsed:${error}`);
  }

}
