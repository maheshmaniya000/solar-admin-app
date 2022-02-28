import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

import { MapModule } from 'ng-project/map/map.module';
import { ProjectListModule } from 'ng-project/project-list/project-list.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { ProjectListViewComponent } from './containers/project-list-view.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule.forChild([
      { path: '', component: ProjectListViewComponent },
    ]),
    SharedModule,
    ProjectListModule,
    MapModule
  ],
  declarations: [
    ProjectListViewComponent
  ]
})
export class ProspectListModule {
}
