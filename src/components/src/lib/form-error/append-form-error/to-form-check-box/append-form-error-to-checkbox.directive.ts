import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Renderer2,
  Self,
  ViewContainerRef
} from '@angular/core';
import { AbstractControlDirective, NgControl } from '@angular/forms';

import { AppendFormErrorDirective } from '../append-form-error.directive';
import { AppendFormErrorService } from '../services/append-form-error.service';
import { insertAfter } from '../utils/insert-after';

@Directive({
  selector: `mat-checkbox[sgAppendFormError]`
})
export class AppendFormErrorToCheckboxDirective extends AppendFormErrorDirective {
  constructor(
    elementRef: ElementRef,
    renderer: Renderer2,
    viewContainerRef: ViewContainerRef,
    componentFactoryResolver: ComponentFactoryResolver,
    appendFormErrorService: AppendFormErrorService,
    changeDetectorRef: ChangeDetectorRef,
    @Self() private readonly ngControl: NgControl
  ) {
    super(
      elementRef,
      renderer,
      viewContainerRef,
      componentFactoryResolver,
      appendFormErrorService,
      changeDetectorRef
    );
  }

  protected placeFormErrorComponent(): void {
    insertAfter(
      this.formErrorComponentRef.location.nativeElement,
      this.elementRef.nativeElement
    );
  }

  protected getControlDirectives(): AbstractControlDirective[] {
    return [this.ngControl];
  }
}
