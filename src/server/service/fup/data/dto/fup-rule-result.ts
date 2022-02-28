/**
 * Each FUP rule should return one of those values:
 * - ALLOW - resources can be accessed, end evaluation of rules and continue with next middleware/service implementation
 * - DENY - resource cannot be accessed, end evaluation of rules and return error code/status code
 * - UNKNOWN - rule cannot determine if resource can be accessed, continue with another rule
 */
export enum FupRuleResult {
  ALLOW = 'ALLOW',
  DENY = 'DENY',
  UNKNOWN = 'UNKNOWN'
}
