import { CdkTableModule } from '@angular/cdk/table';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EffectsModule } from '@ngrx/effects';

import { ProjectListCoreModule } from 'ng-project/project-list/project-list-core.module';
import { ProjectModule } from 'ng-project/project/project.module';
import { SharedModule } from 'ng-shared/shared/shared.module';

import { MultiSelectSidebarComponent } from './components/multi-select/multi-select-sidebar.component';
import { MultiSelectToolbarComponent } from './components/multi-select/multi-select-toolbar.component';
import { ProjectFilterToolbarComponent } from './components/project-filter/project-filter-toolbar.component';
import { ProjectFilterComponent } from './components/project-filter/project-filter.component';
import { ProjectListInfoComponent } from './components/project-list-info/project-list-info.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectMenuComponent } from './components/project-menu/project-menu.component';
import { ProjectToolbarComponent } from './components/project-toolbar/project-toolbar.component';
import { PvConfigSummaryComponent } from './components/pv-config-summary/pv-config-summary.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SearchResultsIconComponent } from './components/search-results/search-results-icon.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SelectedProjectComponent } from './components/selected-project/selected-project.component';
import { SelectDataLayersDialogComponent } from './dialogs/select-data-layers-dialog/select-data-layers-dialog.component';
import { DefaultSettingsEffects } from './effects/default-settings.effects';
import { ProjectListEffects } from './effects/project-list.effects';
import { SearchEffects } from './effects/search.effects';
import { SelectedEffects } from './effects/selected.effects';

const COMPONENTS = [
  MultiSelectSidebarComponent,
  MultiSelectToolbarComponent,
  ProjectFilterComponent,
  ProjectFilterToolbarComponent,
  ProjectListComponent,
  ProjectListInfoComponent,
  ProjectMenuComponent,
  ProjectToolbarComponent,
  PvConfigSummaryComponent,
  SearchInputComponent,
  SearchResultsComponent,
  SearchResultsIconComponent,
  SelectedProjectComponent,
  SelectDataLayersDialogComponent,
];

@NgModule({
  imports: [
    EffectsModule.forFeature([
      DefaultSettingsEffects,
      SearchEffects,
      SelectedEffects,
      ProjectListEffects
    ]),
    CdkTableModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ProjectListCoreModule,
    ProjectModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [...COMPONENTS],
  entryComponents: [
    SearchResultsIconComponent,
    SelectDataLayersDialogComponent,
  ],
  exports: [...COMPONENTS, ProjectListCoreModule, ProjectModule]
})
export class ProjectListModule {

}
