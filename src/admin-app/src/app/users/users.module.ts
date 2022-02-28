import { NgModule } from '@angular/core';

import { AdminSharedModule } from '../shared/admin-shared.module';
import { UserAssignToCompanyComponent } from './components/user-assign-to-company/user-assign-to-company.component';
import { UserCompaniesComponent } from './components/user-companies/user-companies.component';
import { UserEditorComponent } from './components/user-editor/user-editor.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { UserViewComponent } from './components/user-view/user-view.component';
import { UsersTableComponent } from './components/users-table/users-table.component';
import { UsersToolbarComponent } from './components/users-toolbar/users-toolbar.component';
import { ViewUserToolsComponent } from './components/view-user-tools/view-user-tools.component';
import { UserDetailComponent } from './containers/user-detail/user-detail.component';

@NgModule({
  imports: [AdminSharedModule],
  declarations: [
    UsersToolbarComponent,
    UsersTableComponent,
    ViewUserToolsComponent,
    UserDetailComponent,
    UserViewComponent,
    UserEditorComponent,
    UserInfoComponent,
    UserCompaniesComponent,
    UserAssignToCompanyComponent
  ],
  providers: [],
  entryComponents: []
})
export class UsersModule {}
