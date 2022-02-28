import {
  AfterContentInit,
  ChangeDetectorRef,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { AbstractControlDirective } from '@angular/forms';
import { isNil } from 'lodash-es';
import { merge, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { extractTouchedChanges, isNotEmpty } from '../../utils';
import { FormErrorComponent } from './form-error-component/form-error.component';
import { ErrorMessageConfigs } from './models/error-message-configs.model';
import { AppendFormErrorService } from './services/append-form-error.service';

@Directive()
export abstract class AppendFormErrorDirective implements AfterContentInit, OnDestroy {
  @Input() customErrors: ErrorMessageConfigs;
  @Input() formErrorClass: string;

  protected formErrorComponentRef: ComponentRef<FormErrorComponent>;

  private readonly destroyed$ = new Subject<void>();
  private controlDirectives: AbstractControlDirective[];

  constructor(
    protected readonly elementRef: ElementRef,
    protected readonly renderer: Renderer2,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly appendFormErrorService: AppendFormErrorService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngAfterContentInit(): void {
    this.controlDirectives = this.getControlDirectives();
    this.setErrorMessage();
    this.formErrorComponentRef?.changeDetectorRef.detectChanges();
    this.subscribeToInvokingEvents();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  protected abstract placeFormErrorComponent(): void;

  protected abstract getControlDirectives(): AbstractControlDirective[];

  private subscribeToInvokingEvents(): void {
    merge(
      ...this.controlDirectives.map(({ statusChanges }) => statusChanges),
      ...this.controlDirectives.map(({ control }) => extractTouchedChanges(control))
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.setErrorMessage());
  }

  private setErrorMessage(): void {
    const errors = this.getErrorsFromTouchedControls();
    const errorMessage$ = isNotEmpty(errors)
      ? this.appendFormErrorService.getHighestPriorityMessage(errors, this.customErrors)
      : of(undefined);

    errorMessage$.subscribe(errorMessage => {
      if (!isNil(errorMessage)) {
        if (isNil(this.formErrorComponentRef)) {
          this.createFormErrorComponent();
        }
        this.formErrorComponentRef.instance.errorMessage = errorMessage;
      } else {
        this.destroyFormErrorComponent();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  private createFormErrorComponent(): void {
    this.formErrorComponentRef = this.viewContainerRef.createComponent(
      this.componentFactoryResolver.resolveComponentFactory(FormErrorComponent)
    );
    this.formErrorComponentRef.instance.className = this.formErrorClass;
    this.placeFormErrorComponent();
  }

  private destroyFormErrorComponent(): void {
    this.formErrorComponentRef?.destroy();
    this.formErrorComponentRef = undefined;
  }

  private getErrorsFromTouchedControls(): any {
    return Object.assign({}, ...this.controlDirectives.filter(({ touched }) => touched).map(({ errors }) => errors));
  }
}
