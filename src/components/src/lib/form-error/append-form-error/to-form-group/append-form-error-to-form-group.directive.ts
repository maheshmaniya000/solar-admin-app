import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  Optional,
  Renderer2,
  Self,
  ViewContainerRef
} from '@angular/core';
import {
  AbstractControlDirective,
  FormGroupDirective,
  FormGroupName
} from '@angular/forms';
import { compact } from 'lodash-es';

import { AppendFormErrorDirective } from '../append-form-error.directive';
import { AppendFormErrorService } from '../services/append-form-error.service';
import { insertAfter } from '../utils/insert-after';

@Directive({
  selector: `[formGroup][sgAppendFormError], [formGroupName][sgAppendFormError]`
})
export class AppendFormErrorToFormGroupDirective extends AppendFormErrorDirective {
  constructor(
    elementRef: ElementRef,
    renderer: Renderer2,
    viewContainerRef: ViewContainerRef,
    componentFactoryResolver: ComponentFactoryResolver,
    appendFormErrorService: AppendFormErrorService,
    changeDetectorRef: ChangeDetectorRef,
    @Self() @Optional() private readonly formGroupDirective: FormGroupDirective,
    @Self() @Optional() private readonly formGroupNameDirective: FormGroupName
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
    return compact([this.formGroupDirective, this.formGroupNameDirective]);
  }
}
