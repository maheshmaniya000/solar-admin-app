import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';

import { DialogService } from 'components/dialog/service/dialog.service';

import { RequireUserLogin } from '../user/actions/auth.actions';
import { RegistrationStep } from './models/registration-step.enum';
import { RegistrationStore } from './store/registration.store';

@Component({
  selector: 'sg-registration',
  templateUrl: './registration.component.html',
  providers: [RegistrationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationComponent {
  @ViewChild('registrationDialogContent')
  registrationDialogContent: TemplateRef<any>;

  readonly registrationStep = RegistrationStep;

  constructor(
    readonly registrationStore: RegistrationStore,
    private readonly dialogService: DialogService,
    private readonly store: Store
  ) {}

  onOpenRegistrationButtonClick(): void {
    this.dialogService.openLargeDialog(this.registrationDialogContent, {
      disableClose: true
    });
  }

  onLogInButtonClick(): void {
    this.store.dispatch(new RequireUserLogin(undefined));
  }
}
