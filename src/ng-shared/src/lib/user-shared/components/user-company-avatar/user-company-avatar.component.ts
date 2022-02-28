import { Component, Input } from '@angular/core';

import { Company } from '@solargis/types/user-company';

import { UserState } from '../../../user/types';

@Component({
  selector: 'sg-user-company-avatar',
  templateUrl: './user-company-avatar.component.html',
  styleUrls: ['./user-company-avatar.component.scss']
})
export class UserCompanyAvatarComponent {

  @Input() user: UserState;
  @Input() company: Company;

}
