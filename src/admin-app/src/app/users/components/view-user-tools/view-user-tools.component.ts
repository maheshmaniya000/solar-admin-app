import { Component } from '@angular/core';

import { UserDetailStore } from '../../services/user-detail.store';

@Component({
  selector: 'sg-admin-view-user-tools',
  templateUrl: './view-user-tools.component.html'
})
export class ViewUserToolsComponent {
  constructor(readonly userDetailStore: UserDetailStore) {}
}
