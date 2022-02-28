import { TableViewSettings, UserCompanyRole, UserCompanyStatus } from '@solargis/types/user-company';

import { UserColumn } from './user-column.enum';

export class Users {
  static readonly accountIdRouteParamName = 'sgAccountId';
  static readonly tableSettingsKey = 'adminUsers';
  static readonly roles: UserCompanyRole[] = ['USER', 'ADMIN'];
  static readonly statuses: UserCompanyStatus[] = ['ACTIVE', 'SUSPENDED', 'DELETED'];

  static readonly defaultTableSettings: TableViewSettings = {
    columns: Object.values(UserColumn)
  };
}
