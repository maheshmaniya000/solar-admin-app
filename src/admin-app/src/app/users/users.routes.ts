import { Route } from '@angular/router';

import { ComponentMode } from '../shared/models/component-mode.enum';
import { UnsavedChangesGuard } from '../shared/services/unsaved-changes-guard.service';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { UsersToolbarComponent } from './components/users-toolbar/users-toolbar.component';
import { Users } from './constants/users.constants';
import { UserDetailComponent } from './containers/user-detail/user-detail.component';
import { UserDetailGuard } from './services/user-detail.guard';

export const usersRoutes: Route[] = [
  {
    path: `:${Users.accountIdRouteParamName}`,
    canActivate: [UserDetailGuard],
    data: {
      fullscreen: true
    },
    children: [
      {
        path: '',
        component: UserDetailComponent,
        data: {
          mode: ComponentMode.view
        }
      },
      {
        path: 'edit',
        component: UserDetailComponent,
        canDeactivate: [UnsavedChangesGuard],
        data: {
          mode: ComponentMode.edit
        }
      }
    ]
  },
  {
    path: '',
    component: UsersTableComponent
  },
  {
    path: '',
    component: UsersToolbarComponent,
    outlet: 'toolbar'
  }
];
