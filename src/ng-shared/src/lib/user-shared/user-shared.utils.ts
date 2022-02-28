import { Country } from '@solargis/types/user-company';

import { Tokens } from 'ng-shared/user/types';

/** Mark token as expired 100 seconds before expiration */
export function isTokensExpired(tokens: Tokens): boolean {
  const currentTs = Date.now() / 1000;
  return currentTs + 100 > tokens.expiration;
}

export function parsePhone(phoneCode: Country, phone: string): string {
  return `00${phoneCode.callingCode.replace('+', '')}${phone}`;
}
