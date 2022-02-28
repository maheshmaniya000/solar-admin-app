import { Component, Input } from '@angular/core';

import { Company } from '@solargis/types/user-company';

import { UserState } from '../../../user/types';

@Component({
  selector: 'sg-user-company-item',
  templateUrl: './user-company-item.component.html',
  styleUrls: ['./user-company-item.component.scss']
})
export class UserCompanyItemComponent {

  @Input() user: UserState;
  @Input() company: Company;

}
