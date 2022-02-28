import { ContentChildren, Directive, QueryList } from '@angular/core';
import {
  AbstractControlDirective,
  FormGroupDirective,
  FormGroupName,
  NgControl
} from '@angular/forms';

import { AppendFormErrorDirective } from '../append-form-error.directive';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-form-field:not([doNotAppendFormError])'
})
export class AppendFormErrorToFormFieldDirective extends AppendFormErrorDirective {
  private static readonly matErrorParentClassQuery = '.mat-form-field-subscript-wrapper';

  @ContentChildren(NgControl, { descendants: true })
  ngControls: QueryList<AbstractControlDirective>;
  @ContentChildren(FormGroupDirective, { descendants: true })
  formGroupDirectives: QueryList<AbstractControlDirective>;
  @ContentChildren(FormGroupName, { descendants: true })
  formGroupNames: QueryList<AbstractControlDirective>;

  protected placeFormErrorComponent(): void {
    const matFormFieldSubscriptWrapperDiv: HTMLDivElement =
      this.elementRef.nativeElement.querySelector(
        AppendFormErrorToFormFieldDirective.matErrorParentClassQuery
      );
    this.renderer.appendChild(
      matFormFieldSubscriptWrapperDiv,
      this.formErrorComponentRef.location.nativeElement
    );
  }

  protected getControlDirectives(): AbstractControlDirective[] {
    return [
      ...this.ngControls.toArray(),
      ...this.formGroupNames.toArray(),
      ...this.formGroupDirectives.toArray()
    ];
  }
}
