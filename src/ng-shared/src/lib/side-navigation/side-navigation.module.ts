import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { TranslationModule } from '@solargis/ng-translation';

import { SharedModule } from 'ng-shared/shared/shared.module';

import { SideNavigationItemComponent } from './components/side-navigation-item/side-navigation-item.component';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';

const DECLARATIONS = [
  SideNavigationComponent,
  SideNavigationItemComponent,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    TranslationModule,
    SharedModule,
  ],
  declarations: [...DECLARATIONS],
  exports: [
    ...DECLARATIONS,
  ]
})

export class SideNavigationModule {}
