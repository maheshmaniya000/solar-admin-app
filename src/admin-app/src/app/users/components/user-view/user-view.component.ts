import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

import { User } from '@solargis/types/user-company';

import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { UserDetailStore } from '../../services/user-detail.store';
import { UserViewStore } from './user-view.store';

@Component({
  selector: 'sg-admin-user-view',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', './user-view.component.scss'],
  templateUrl: './user-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserViewStore]
})
export class UserViewComponent implements OnChanges {
  @Input() user: User;

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

  constructor(
    readonly userDetailStore: UserDetailStore,
    readonly userViewStore: UserViewStore,
    readonly detailNavigationService: DetailNavigationService
  ) {}

  ngOnChanges(): void {
    this.userViewStore.setUser(this.user);
  }
}
