import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'sg-form-group-reset',
  template: '<button mat-icon-button (click)="reset()"> <mat-icon>clear</mat-icon> </button>'
})
export class FormGroupResetComponent {
  @Input() formGroup: FormGroup;

  reset(): void {
    this.formGroup?.reset();
  }
}
