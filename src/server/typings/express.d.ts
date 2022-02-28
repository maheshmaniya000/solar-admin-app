import { CompanyTokenContent, UserRef } from '@solargis/types/user-company';

declare global {

  namespace Express {

    interface Request {
      companyToken?: CompanyTokenContent;
      permissions?: string[];
      userRef?: UserRef;
      // express-jwt
      user?: {
        email: string;
        sub: string;
      };
    }

  }

}
