import { removeEmpty } from '@solargis/types/utils';

export function userFullName(user: { firstName?: string; lastName?: string }): string {
  return user ? removeEmpty([user.firstName, user.lastName], false, true, true).join(' ') : '';
}
