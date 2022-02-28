import { Pipe, PipeTransform } from '@angular/core';

import { userFullName } from '../utils/user.utils';

@Pipe({ name: 'sgUserFullName' })
export class UserFullNamePipe implements PipeTransform {
  transform(user: { firstName?: string; lastName?: string }): string {
    return userFullName(user);
  }
}
