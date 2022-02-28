import { Component } from '@angular/core';

import { Company, User, UserCompanyRole, UserCompanyStatus } from '@solargis/types/user-company';

import { getActiveAdminsCount, getUserRoleInCompany, getUserStatusInCompany } from '../../../shared/admin.utils';
import { Users } from '../../constants/users.constants';
import { UserViewStore } from '../user-view/user-view.store';

@Component({
  selector: 'sg-admin-user-companies',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', './user-companies.component.scss'],
  templateUrl: './user-companies.component.html'
})
export class UserCompaniesComponent {
  readonly getUserRoleInCompany = getUserRoleInCompany;
  readonly getUserStatusInCompany = getUserStatusInCompany;
  readonly roles = Users.roles;
  readonly statuses = Users.statuses;

  constructor(readonly userViewStore: UserViewStore) {}

  doesNotHaveOtherAdmins(company: Company, user: User): boolean {
    const activeAdmins = getActiveAdminsCount(company);
    return (
      activeAdmins === 1
      && getUserRoleInCompany(company, user) === 'ADMIN'
      && getUserStatusInCompany(company, user) === 'ACTIVE'
    ) || activeAdmins === 0;
  }

  changeRole(company: Company, user: User, role: UserCompanyRole): void {
    this.userViewStore.changeRoleAndStatus({
      sgCompanyId: company.sgCompanyId,
      role,
      status: getUserStatusInCompany(company, user)
    });
  }

  changeStatus(company: Company, user: User, status: UserCompanyStatus): void {
    this.userViewStore.changeRoleAndStatus({
      sgCompanyId: company.sgCompanyId,
      role: getUserRoleInCompany(company, user),
      status
    });
  }
}
