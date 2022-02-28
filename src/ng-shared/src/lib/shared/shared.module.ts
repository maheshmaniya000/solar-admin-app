import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';

import { GeosearchModule } from '@solargis/ng-geosearch';
import { TranslationModule } from '@solargis/ng-translation';
import { UnitValueModule } from '@solargis/ng-unit-value';

import { AccountOverviewComponent } from './components/account-overview/account-overview.component';
import { AlertBarContainerComponent } from './components/alert-bar-container/alert-bar-container.component';
import { AlertBarComponent } from './components/alert-bar/alert-bar.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { BottomNavigationComponent } from './components/bottom-navigation/bottom-navigation.component';
import { CommingSoonComponent } from './components/comming-soon/comming-soon.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { DrawerButtonComponent } from './components/drawer-button/drawer-button.component';
import { DrawerLayoutComponent } from './components/drawer-layout/drawer-layout.component';
import { FullscreenDialogToolbarNewComponent } from './components/fullscreen-dialog-toolbar-new/fullscreen-dialog-toolbar-new.component';
import { FullscreenDialogToolbarComponent } from './components/fullscreen-dialog-toolbar/fullscreen-dialog-toolbar.component';
import { GravatarComponent } from './components/gravatar/gravatar.component';
import { MutedComponent } from './components/muted.component';
import { NoContentComponent } from './components/no-content.component';
import { NoValueComponent } from './components/no-value.component';
import { ProjectDataKeyComponent } from './components/project-data-key/project-data-key.component';
import { SettingsMenuComponent } from './components/settings-menu/settings-menu.component';
import { TimezoneComponent } from './components/timezone/timezone.component';
import { ToggleDataUnitsDialogComponent } from './components/toggle-data-units-dialog/toggle-data-units-dialog.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TrademarkComponent } from './components/trademark/trademark.component';
import { TranslationSnackbarComponent } from './components/translation/translation-snackbar.component';
import { DebounceClickDirective } from './directives/debounce-click.directive';
import { InputLocaleFormatterDirective } from './directives/input-locale-formatter.directive';
import { ScrollContainerDirective } from './directives/scroll-container.directive';
import { ScrollOnDirective } from './directives/scroll-on.directive';
import { UnitValueInputDirective } from './directives/unit-value-input.directive';
import { DateTimeFormatPipe } from './pipes/date-time-format.pipe';
import { UserFullNamePipe } from './pipes/user-full-name.pipe';

const DECLARATIONS = [
  AccountOverviewComponent,
  AlertBarComponent,
  AlertBarContainerComponent,
  AvatarComponent,
  BottomNavigationComponent,
  CommingSoonComponent,
  ConfirmationDialogComponent,
  DateTimeFormatPipe,
  DebounceClickDirective,
  DialogComponent,
  DrawerButtonComponent,
  DrawerLayoutComponent,
  FullscreenDialogToolbarComponent,
  FullscreenDialogToolbarNewComponent,
  GravatarComponent,
  InputLocaleFormatterDirective,
  MutedComponent,
  NoContentComponent,
  NoValueComponent,
  ProjectDataKeyComponent,
  ScrollContainerDirective,
  ScrollOnDirective,
  SettingsMenuComponent,
  TimezoneComponent,
  ToggleDataUnitsDialogComponent,
  ToolbarComponent,
  TrademarkComponent,
  TranslationSnackbarComponent,
  UnitValueInputDirective,
  UserFullNamePipe
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    GeosearchModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    RouterModule,
    TranslationModule,
    TranslocoModule,
    UnitValueModule
  ],
  declarations: [ ...DECLARATIONS ],
  entryComponents: [
    ConfirmationDialogComponent,
    TranslationSnackbarComponent,
    ToggleDataUnitsDialogComponent,
  ],
  exports: [
    ...DECLARATIONS,
    CommonModule,
    FlexLayoutModule,
    GeosearchModule,
    RouterModule,
    TranslocoModule,
    TranslationModule,
    UnitValueModule,
  ],
  providers: [
    DatePipe,
    DateTimeFormatPipe,
    UserFullNamePipe,
  ]
})
export class SharedModule {}
