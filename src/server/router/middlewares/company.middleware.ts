import { Request, RequestHandler } from 'express';
import { UNAUTHORIZED } from 'http-status-codes';

import { verifyCompanyToken } from '@solargis/jwt';
import { mapProspectLicense, AppSubscriptionType, ProspectLicense, UserCompanyRole } from '@solargis/types/user-company';

import { Response } from 'ng-shared/utils/response';

function sendCompanyError(req, res, code = 'company_error'): void {
  const result: Response = { status: false, code };
  // console.log(req.companyToken, req.params);
  res.status(UNAUTHORIZED).json(result);
}

export const setCompanyToken: RequestHandler = (req, res, next) => {
  const token = req.get('x-solargis-company');
  if (token) {
    try {
      req.companyToken = verifyCompanyToken(req.user.sub, token);
      next();

    } catch (err) {
      sendCompanyError(req, res, 'company_invalid_token');
    }
  } else {next();}
};

export function checkCompanyToken(companyIdParam: string, requiredRole?: UserCompanyRole): RequestHandler {
  return (req, res, next) => {
    const sgCompanyId = req.params[companyIdParam];

    if (!req.companyToken) {
      sendCompanyError(req, res, 'company_unauthorized');

    } else if (req.companyToken.sgCompanyId !== sgCompanyId) {
      sendCompanyError(req, res, 'company_invalid_id');

    } else if (requiredRole && req.companyToken.role !== requiredRole) {
      sendCompanyError(req, res, 'company_no_required_role');

    } else {next();}
  };
};

export function requireAppSubscriptionType(req: Request, subscriptionType: AppSubscriptionType): void {
  const { companyToken: { prospectLicense } } = req;

  const prospectSubscription = mapProspectLicense(prospectLicense as ProspectLicense);

  if (!prospectSubscription || prospectSubscription.type !== subscriptionType) {
    throw new Object({
      status: UNAUTHORIZED,
      code: 'company.no_subscription'
    });
  }

  const { from, to } = prospectLicense;
  const now = Date.now();

  if (!(from < now && now < to)) {
    throw new Object({
      status: UNAUTHORIZED,
      code: 'company.invalid_subscription'
    });
  }
}
