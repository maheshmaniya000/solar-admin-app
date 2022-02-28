import { Component, Input } from '@angular/core';

import { Company, User } from '@solargis/types/user-company';

@Component({
  selector: 'sg-account-overview',
  styleUrls: ['./account-overview.component.scss'],
  templateUrl: './account-overview.component.html'
})
export class AccountOverviewComponent {
  @Input() user: User;
  @Input() company: Company;
  @Input() hideOnSmallScreen: boolean;

  userCompanyRole(): string | null {
    const user = this.company.users.find(u => u.sgAccountId === this.user.sgAccountId);
    return user ? user.role : null;
  }
}

