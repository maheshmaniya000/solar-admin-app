import { RequestHandler, Response } from 'express';
import { FORBIDDEN } from 'http-status-codes';

import { ipBlacklist } from '../../env';
import { resolveRemoteIP } from '../../util/middleware.utils';

function handleBlackistedIP(ip: string, res: Response, type: 'REGEX' | 'IPS'): void {
  console.log(`IP ${ip} blacklisted... (by ${type})`);
  setTimeout(() => {
    res.status(FORBIDDEN).send({
      status: false,
      code: 'captcha_not_valid'
    });
  }, ipBlacklist.timeout);
}

export const ipBlacklistMiddleware: RequestHandler = (req, res, next) => {
  const ip = resolveRemoteIP(req);

  if (ipBlacklist.regex && ipBlacklist.regex.test(ip)) {
    handleBlackistedIP(ip, res, 'REGEX');

  } else if (ipBlacklist.ips.length && ipBlacklist.ips.includes(ip)) {
    handleBlackistedIP(ip, res, 'IPS');

  } else {next();}
};

