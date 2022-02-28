import { FORBIDDEN } from 'http-status-codes';
import fetch from 'node-fetch';
import { defer, Observable, of } from 'rxjs';

import * as lambdaCaptcha from '@solargis/lambda-captcha';
import {
  CaptchaResult,
  LambdaCaptchaResult,
  RecaptchaResult
} from '@solargis/types/captcha';

import { Response } from 'ng-shared/utils/response';

import { lambdaCaptchaOpts, recaptchaOpts } from '../../env';

/**
 * Reusable function which check if given recaptcha token is valid
 *
 * @param captcha
 * @param deviceType
 * @returns true if recaptcha token is valid
 */
 export function checkRecaptcha(
  captcha: RecaptchaResult,
  deviceType: string
): Observable<boolean> {
  const secretKey =
    deviceType && deviceType === 'android'
      ? recaptchaOpts.androidSecretKey
      : recaptchaOpts.secretKey;

  console.log(
    `Check recaptcha for deviceType '${deviceType}' ` +
    `secretKey '${secretKey.substr(
      0,
      secretKey.length > 10 ? 10 : secretKey.length
    )}' (part of it)`
  );
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha.recaptchaCheck}`;

  return defer(async () => {
    const response = await fetch(verifyUrl, { method: 'POST' });
    const responseJson = await response.json();
    // FIXME check score https://solargis.atlassian.net/browse/SG2-5951
    return response.status === 200 && response.ok && !responseJson.success;
  });
}

/**
 * Reusable function which check if given code from svg is valid
 *
 * @param captcha
 * @returns true if recaptcha token is valid
 */
export function checkLambdaCaptcha(
  captcha: LambdaCaptchaResult
): Observable<boolean> {
  console.log(`Check lambdaCaptcha`);

  return new Observable<boolean>(observer => {
    const { encryptedExpr, solution } = captcha;

    const verification = lambdaCaptcha.verify(
      encryptedExpr,
      solution,
      lambdaCaptchaOpts.secretKey,
      lambdaCaptchaOpts.signatureKey
    );

    if (verification === true) {
      observer.next(true);
    } else {
      observer.next(false);
    }
  });
}

/**
 * Reusable function which check if given recaptcha token is valid
 *
 * @param captcha
 * @param deviceType?
 * @returns true if recaptcha token is valid
 */
 export function checkCaptcha(
  captcha: CaptchaResult,
  deviceType?: string
): Observable<boolean> {
  if (captcha.captchaType === 'recaptcha')
    {return checkRecaptcha(captcha as RecaptchaResult, deviceType);}
  if (captcha.captchaType === 'lambdaCaptcha')
    {return checkLambdaCaptcha(captcha as LambdaCaptchaResult);}
  return of(false);
}

/**
 * Google recaptcha middleware.
 * Required is request parameter (POST) in body 'recaptchaCheck'.
 * If recaptcha is not valid, error response with status 403 and code 'captcha_not_valid' is send to response.
 *
 * TODO : add logging (starting regaptcha validation, result, ...)
 *
 * @deprecated already ported to sg-api-users-companies
 *
 * @param req
 * @param res
 * @param next
 */
export function captchaMiddleware(req, res, next): void {
  const result: Response = {
    status: false,
    code: null
  };
  if (!req.body.captcha) {
    result.code = 'captcha_required';
    res.status(FORBIDDEN).json(result);
  } else {
    checkCaptcha(req.body.captcha, req.headers['device-type']).subscribe(
      recaptchaCheckResult => {
        if (recaptchaCheckResult) {
          next();
        } else {
          result.code = 'captcha_not_valid';
          res.status(FORBIDDEN).json(result);
        }
      }
    );
  }
}


