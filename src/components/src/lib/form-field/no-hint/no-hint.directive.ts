import { ContentChild, Directive, HostBinding } from '@angular/core';
import { MatHint } from '@angular/material/form-field';
import { isNil } from 'lodash-es';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-form-field'
})
export class NoHintDirective {
  @ContentChild(MatHint) hint: MatHint;
  @HostBinding('class.no-hint')
  get noHintClassApplied(): boolean {
    return isNil(this.hint);
  }
}
