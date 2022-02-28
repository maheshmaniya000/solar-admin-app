import { CompanyRef } from '@solargis/types/user-company';

export function companyRefToString(company: CompanyRef): string {
  if (company) {
    return `(${company.sgCompanyId}) ${company.name}`;
  } else {
    return null;
  }
}
