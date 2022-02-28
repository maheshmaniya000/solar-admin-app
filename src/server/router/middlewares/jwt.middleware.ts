import { RequestHandler } from 'express';
import * as jwt from 'express-jwt';
import { UNAUTHORIZED } from 'http-status-codes';
import * as jwksRsa from 'jwks-rsa';
import { get, difference, isEqual } from 'lodash-es';

import { mergeCompanyTokenPermissions } from '@solargis/types/permissions';

import { Response } from 'ng-shared/utils/response';

import { auth0ManagementOpts, auth0Opts, env } from '../../env';

export const userPermissionsPath = [auth0Opts.customNamespace, 'app_metadata', 'authorization', 'permissions'];

function mergeAllUserPermissions(req): string[] {
  const userPermissions = get(req.user, userPermissionsPath, []);
  return mergeCompanyTokenPermissions(env, userPermissions, req.companyToken);
}

// check array in array approach: https://github.com/lodash/lodash/issues/1743

function hasRequiredPermissions(permissions: string[], requiredPermissions: string[]): boolean {
  return permissions && difference(requiredPermissions, permissions).length === 0;
}

// check JWT, Validate the audience and the issuer
export const jwtOpts: jwt.Options = {
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${auth0ManagementOpts.url}/.well-known/jwks.json`
  }),
  audience: auth0Opts.clientId,
  issuer: `${auth0ManagementOpts.url}/`,
  algorithms: ['RS256'],
  credentialsRequired: false
};

export const setUserRef: RequestHandler = (req, res, next) => {
  if (req.user) {
    const { sub: sgAccountId, email } = req.user;
    req.userRef = { sgAccountId, email };
  }
  next();
};

/**
 * Helper middleware to setup permissions from user JWT and company token into req.permissions
 */
export const setPermissions: RequestHandler = (req, res, next) => {
  req.permissions = mergeAllUserPermissions(req);
  next();
};

/**
 * Check if JWT token contains specified fields. Dot notation can be used for nested objects.
 * JWT is decoded as `req.user`
 *
 * @param fields - fields to check in `req.user`
 * @param errorCode - optional error code if any of specified fields is missing
 */

export function checkJWT(fields = [], errorCode = 'jwt_no_fields'): (req: any, res: any, next: () => void) => void {
  function sendJWTError(res, missingFields?: string[]): void {
    const result: Response = {
      status: false,
      code: missingFields && missingFields.length ? errorCode : 'no_jwt'
    };
    res.status(UNAUTHORIZED).json(result);
  }

  return function(req, res, next) {
    if (req.user) {
      const jwtFields = fields.filter(f => get(req.user, f));
      if (!isEqual(fields, jwtFields)) {sendJWTError(res, jwtFields);}
      else {next();}
    } else {sendJWTError(res);}
  };
}

/**
 * Helper middleware to check user in JWT
 *
 * @type {(req, res, next) => void}
 */
export const checkJWTUser = checkJWT(['sub', 'email'], 'jwt_no_user');

/**
 *  Check if JWT tokens have all required permissions.
 *  Permissions are checked against Auth0 JWT - '[https://solargis.com][authorization][permissions]'
 *  and solargis user-company JWT token permissions
 *
 * @param requiredPermissions - list of required permissions.
 */
export function checkPermissions(...requiredPermissions: string[]): (req: any, res: any, next: () => void) => void {
  /**
   * Send error -> not enough of permissions
   *
   * @param res
   */
  function sendNotEnoughPermissionsError(res): void {
    const result: Response = {
      status: false,
      code: 'jwt_no_permissions'
    };
    res.status(UNAUTHORIZED).json(result);
  }

  return function(req, res, next) {
    const permissions = req.permissions || mergeAllUserPermissions(req);
    if (hasRequiredPermissions(permissions, requiredPermissions)) {next();}
    else {sendNotEnoughPermissionsError(res);}
  };

}

