import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { ltaDatasetFactory, LTA_DATASET } from 'ng-project/project/services/lta-dataset.factory';

import { AppSubscriptionModule } from '../app-subscription/app-subscription.module';
import { Config } from '../config';
import { SharedModule } from '../shared/shared.module';
import { UserSharedModule } from '../user-shared/user-shared.module';
import { CompanyListComponent } from './components/company-list/company-list.component';
import { PersonalInfoFormComponent } from './components/personal-info-form/personal-info-form.component';
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component';
import { ProfileComponent } from './containers/profile/profile.component';

@NgModule({
  imports: [
    AppSubscriptionModule,
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatMenuModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          fullscreen: true
        }
      }
    ]),
    SharedModule,
    UserSharedModule
  ],
  declarations: [
    CompanyListComponent,
    PersonalInfoFormComponent,
    ProfileComponent,
    ProfileDetailComponent
  ],
  providers: [
    { provide: LTA_DATASET, useFactory: ltaDatasetFactory, deps: [Config] }
  ]
})
export class UserAdminModule {}
