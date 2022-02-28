import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { UserSharedModule } from 'ng-shared/user-shared/user-shared.module';

import { CaptchaModule } from '../captcha/captcha.module';
import { FupModule } from '../fup/fup.module';
import { SharedModule } from '../shared/shared.module';
import { ChangePasswordDialogComponent } from './components/change-password/change-password.dialog';
import { CompanyWelcomeDialogComponent } from './components/company-welcome-dialog/company-welcome-dialog.component';
import { ConfirmTermsDialogComponent } from './components/confirm-terms/confirm-terms.dialog';
import { EmailVerifyDialogComponent } from './components/email-verify/email-verify.dialog';
import { ForgotPasswordDialogComponent } from './components/forgot-password/forgot-password.dialog';
import { ForgotPasswordChangeDialogComponent } from './components/fotgot-password-change/forgot-password-change.dialog';
import { LoginDialogComponent } from './components/login/login.dialog';
import { RegistrationDialogFormComponent } from './components/registration-dialog/registration-dialog-form.component';
import { RegistrationDialogComponent } from './components/registration-dialog/registration-dialog.component';
import { SuccessMessageComponent } from './components/success-message/success-message.component';
import { UserInvitationDialogComponent } from './components/user-invitation-dialog/user-invitation-dialog.component';
import { AuthEffects } from './effects/auth.effects';
import { CompanyEffects } from './effects/company.effects';
import { UserEffects } from './effects/user.effects';
import { HasSelectedCompanyGuard } from './guards/has-selected-company.guard';
import { LoginUserGuard } from './guards/login-user.guard';
import { userModuleReducer } from './reducers/user.reducer';


@NgModule({
  imports: [
    EffectsModule.forFeature([
      UserEffects, AuthEffects, CompanyEffects
    ]),
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
    MatStepperModule,
    SharedModule,
    FormsModule,
    FupModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    CaptchaModule,
    StoreModule.forFeature('user', userModuleReducer),
    UserSharedModule,
  ],
  declarations: [
    RegistrationDialogComponent,
    RegistrationDialogFormComponent,
    LoginDialogComponent,
    EmailVerifyDialogComponent,
    ChangePasswordDialogComponent,
    ForgotPasswordDialogComponent,
    ForgotPasswordChangeDialogComponent,
    ConfirmTermsDialogComponent,
    CompanyWelcomeDialogComponent,
    SuccessMessageComponent,
    UserInvitationDialogComponent
  ],
  providers: [
    // provided in root: AppDeviceService
    // provided in root: AuthenticationService,
    // provided in root: Auth0Service,
    // provided in root: CompanyService,
    LoginUserGuard,
    HasSelectedCompanyGuard,
    // provided in root: UserService,
  ],
  entryComponents: [
    RegistrationDialogComponent,
    LoginDialogComponent,
    EmailVerifyDialogComponent,
    ChangePasswordDialogComponent,
    ForgotPasswordChangeDialogComponent,
    ForgotPasswordDialogComponent,
    ConfirmTermsDialogComponent,
    CompanyWelcomeDialogComponent,
    UserInvitationDialogComponent
  ],
})
export class UserModule { }
