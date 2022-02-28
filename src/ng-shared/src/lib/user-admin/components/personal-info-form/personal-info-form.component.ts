import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { translate } from '@ngneat/transloco';
import { Store } from '@ngrx/store';

import { User } from '@solargis/types/user-company';

import { firstNameOrLastNameValidator } from 'ng-shared/user/utils/firstname-or-lastname.validator';

import { UserData } from '../../../user/actions/auth.actions';
import { State } from '../../../user/reducers';
import { UserService } from '../../../user/services/user.service';

@Component({
  selector: 'sg-personal-info-form',
  templateUrl: './personal-info-form.component.html',
  styleUrls: ['./personal-info-form.component.scss']
})
export class PersonalInfoFormComponent implements OnInit {

  @Input() user: User;

  isWorking = false; // show/hide spinner

  form: FormGroup;
  get firstName(): AbstractControl { return this.form.get('firstName'); }
  get lastName(): AbstractControl { return this.form.get('lastName'); }

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly store: Store<State>,
    private readonly snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [this.user && this.user.firstName, []],
      lastName: [this.user && this.user.lastName, []],
    }, {
      validator: firstNameOrLastNameValidator('firstName', 'lastName')
    });
  }

  /**
   * When user is inside form and hit enter -> change password if form is valid
   */
  clickOnEnter(event: any): void {
    if (event.keyCode === 13) {
      if (this.form.valid) {
        this.changeName();
      }
      event.preventDefault();
    }
  }

  changeName(): void {
    if (!this.isWorking && !this.form.hasError('invalidFirstNameOrLastName')) {
      this.isWorking = true;
      const { firstName, lastName } = this.form.value;

      this.userService.updateUser(this.user.sgAccountId, { firstName, lastName }).subscribe(res => {
          this.isWorking = false;
          this.form.controls.firstName.setValue(res.firstName);
          this.form.controls.lastName.setValue(res.lastName);
          this.store.dispatch(new UserData(res));
          this.snackBar.open(translate('common.snackBar.changesSaved'), null,
            { duration: 3000, panelClass:['snackbarPass', 'snackbarTextCenter']
          });
        }, () => {
          this.isWorking = false;
          this.snackBar.open(translate('common.snackBar.couldNotSaveChange'), null,
            { duration: 3000, panelClass:['snackbarError', 'snackbarTextCenter']
          });
        });
    }
  }
}
