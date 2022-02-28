import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';

import { Company, CompanyWithToken, User, UserCompanyRole } from '@solargis/types/user-company';

import { userFullName } from '../../../shared/utils/user.utils';

type CompanyOrUser = CompanyWithToken | User;

@Component({
  selector: 'sg-company-list',
  templateUrl: './company-list.component.html',
  styleUrls: ['./company-list.component.scss']
})
export class CompanyListComponent implements OnChanges {
  items: CompanyOrUser[];
  columns = ['avatar', 'name', 'type', 'role', 'updated', 'options'];

  @Input() companyList: CompanyWithToken[];
  @Input() selectedCompany: Company;
  @Input() user: User;

  @Output() onSelect = new EventEmitter<CompanyWithToken>();
  @Output() onEdit = new EventEmitter<CompanyWithToken>();
  @Output() unselect = new EventEmitter<void>();

  ngOnChanges(): void {
    this.items = [this.user, ...this.companyList];
  }

  isCompany(companyOrUser: CompanyOrUser): companyOrUser is CompanyWithToken {
    return Object.prototype.hasOwnProperty.call(companyOrUser, 'company');
  }

  isSelected(companyOrUser: CompanyOrUser): boolean {
    return this.isCompany(companyOrUser)
      ? (companyOrUser.company === this.selectedCompany)
      : !this.selectedCompany;
  }

  getName(companyOrUser: CompanyOrUser): string {
    return this.isCompany(companyOrUser)
      ? companyOrUser.company.name
      : userFullName(companyOrUser);
  }

  getRole(companyOrUser: CompanyWithToken): UserCompanyRole | undefined {
    if (this.isCompany(companyOrUser)) {
      return companyOrUser.company.users.find(u => u.sgAccountId === this.user.sgAccountId).role;
    }
  }

  edit(company: CompanyWithToken, event: any): void {
    event.stopPropagation();
    this.onEdit.emit(company);
  }
}
