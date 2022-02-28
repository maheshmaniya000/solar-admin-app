import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { TranslationModule } from '@solargis/ng-translation';

import { SharedModule } from 'ng-shared/shared/shared.module';

import { AppSubscriptionUsersComponent } from './components/app-subscription-users/app-subscription-users.component';
import { SDATSubscriptionDevicesComponent } from './components/sdat-subscription-devices/sdat-subscription-devices.component';
import { TokenDialogComponent } from './components/token-dialog/token.dialog';

const DECLARATIONS = [
  AppSubscriptionUsersComponent,
  SDATSubscriptionDevicesComponent,
  TokenDialogComponent
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    TranslationModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule
  ],
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS]
})
export class AppSubscriptionModule {}
