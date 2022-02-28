import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ResizableModule } from 'angular-resizable-element';

import { FormErrorModule } from 'components/form-error/form-error.module';
import { SharedModule } from 'ng-shared/shared/shared.module';
import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';

import { ColumnSelectorComponent } from './components/column-selector/column-selector.component';
import { CompanyAutocompleteComponent } from './components/company-autocomplete/company-autocomplete.component';
import { CompanyInfoComponent } from './components/company-info/company-info.component';
import { CompanySnapshotEditorComponent } from './components/company-snapshot-editor/company-snapshot-editor.component';
import { ContactsEditorComponent } from './components/contacts-editor/contacts-editor.component';
import { ContactsTableComponent } from './components/contacts-table/contacts-table.component';
import { ExportTableDataComponent } from './components/export-table-data/export-table-data.component';
import { FormGroupResetComponent } from './components/form-group-reset/form-group-reset.component';
import { OriginDataComponent } from './components/origin-data/origin-data.component';
import { AdminToolbarSearchComponent } from './components/toolbar-search/admin-toolbar-search.component';
import { LayoutComponent } from './containers/layout.component';
import { ColumnSelectorDialogComponent } from './dialogs/column-selector-dialog.component';

@NgModule({
  declarations: [
    LayoutComponent,
    AdminToolbarSearchComponent,
    ColumnSelectorDialogComponent,
    ColumnSelectorComponent,
    CompanySnapshotEditorComponent,
    ContactsEditorComponent,
    ContactsTableComponent,
    CompanyAutocompleteComponent,
    CompanyInfoComponent,
    ExportTableDataComponent,
    FormGroupResetComponent,
    OriginDataComponent
  ],
  providers: [DatePipe],
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatExpansionModule,
    ReactiveFormsModule,
    ResizableModule,
    RouterModule,
    SharedModule,
    FormErrorModule
  ],
  exports: [
    LayoutComponent,
    AdminToolbarSearchComponent,
    ColumnSelectorComponent,
    CompanySnapshotEditorComponent,
    ContactsEditorComponent,
    ContactsTableComponent,
    CompanyAutocompleteComponent,
    CompanyInfoComponent,
    ExportTableDataComponent,
    FormGroupResetComponent,
    OriginDataComponent,
    AngularEditorModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatCardModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatTabsModule,
    MatRadioModule,
    MatListModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSelectModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    UserSharedModule
  ]
})
export class AdminSharedModule {}
