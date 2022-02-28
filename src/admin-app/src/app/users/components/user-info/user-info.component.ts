import { ChangeDetectionStrategy, Component } from '@angular/core';

import { User } from '@solargis/types/user-company';

import { UserViewStore } from '../user-view/user-view.store';

@Component({
  selector: 'sg-admin-user-info',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', './user-info.component.scss'],
  templateUrl: './user-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoComponent {
  readonly props: { label: string; key: keyof User }[] = [
    { label: 'ID', key: 'sgAccountId' },
    { label: 'Email', key: 'email' },
    { label: 'Salutation name', key: 'salutation' },
    { label: 'First name', key: 'firstName' },
    { label: 'Last name', key: 'lastName' },
    { label: 'Middle name', key: 'middleName' },
    { label: 'Position', key: 'position' },
    { label: 'Phone', key: 'phone' }
  ];

  constructor(readonly userViewStore: UserViewStore) {}
}
