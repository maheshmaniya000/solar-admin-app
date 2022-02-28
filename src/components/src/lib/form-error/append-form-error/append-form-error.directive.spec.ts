import { ChangeDetectorRef, ComponentFactoryResolver, Directive, ElementRef, Renderer2, Self, ViewContainerRef } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { AbstractControlDirective, FormControl, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { TranslocoTestingModule } from '@ngneat/transloco';

import { FormErrorModule } from '../form-error.module';
import { AppendFormErrorDirective } from './append-form-error.directive';
import { FormErrorComponent } from './form-error-component/form-error.component';
import { ErrorMessageConfigs } from './models/error-message-configs.model';
import { AppendFormErrorService } from './services/append-form-error.service';
import { AppendFormErrorTestUtils } from './utils/append-form-error-test.utils';

import SpyInstance = jest.SpyInstance;
import spyOn = jest.spyOn;

describe('AppendFormErrorDirective', () => {
  describe('component', () => {
    @Directive({
      // eslint-disable-next-line @angular-eslint/directive-selector
      selector: 'input[formControl]'
    })
    class TestAppendFormErrorDirective extends AppendFormErrorDirective {
      constructor(
        elementRef: ElementRef,
        renderer: Renderer2,
        viewContainerRef: ViewContainerRef,
        componentFactoryResolver: ComponentFactoryResolver,
        appendFormErrorService: AppendFormErrorService,
        changeDetectorRef: ChangeDetectorRef,
        @Self() private readonly ngControl: NgControl
      ) {
        super(elementRef, renderer, viewContainerRef, componentFactoryResolver, appendFormErrorService, changeDetectorRef);
      }

      protected placeFormErrorComponent(): void {
        this.renderer.appendChild(this.elementRef.nativeElement, this.formErrorComponentRef.location.nativeElement);
      }

      protected getControlDirectives(): AbstractControlDirective[] {
        return [this.ngControl];
      }
    }
    const createDirective = createDirectiveFactory({
      directive: TestAppendFormErrorDirective,
      imports: [FormErrorModule, ReactiveFormsModule, TranslocoTestingModule.forRoot({ langs: {} })],
      shallow: true
    });
    let spectator: SpectatorDirective<TestAppendFormErrorDirective>;

    describe('error message rendering', () => {
      const formErrorClass = 'some-class';
      const template = `
          <input
            [formControl]="formControl"
            [customErrors]="customErrors"
            formErrorClass="${formErrorClass}"
          />
        `;
      let getHighestPriorityMessageSpy: SpyInstance;
      let formControl: FormControl;

      const expectFormErrorNotToExist = (): void => {
        expect(spectator.query(FormErrorComponent)).not.toExist();
      };

      const expectFormErrorToExist = (): void => {
        expect(spectator.query(FormErrorComponent, { read: ElementRef }).nativeElement).toContainText('en.common.validation.required');
      };

      const setupTest = ({
        initialFormValue,
        customErrors,
        touched
      }: {
        initialFormValue?: string | boolean;
        customErrors?: ErrorMessageConfigs;
        touched?: boolean;
      }): void => {
        formControl = new FormControl(initialFormValue, {
          validators: Validators.required
        });
        if (touched) {
          formControl.markAsTouched();
        }
        spectator = createDirective(template, {
          hostProps: { formControl, customErrors }
        });

        getHighestPriorityMessageSpy = spyOn(spectator.inject(AppendFormErrorService), 'getHighestPriorityMessage');
      };

      describe('initialization', () => {
        it(`should render error message of already invalid and already
 touched form control when the directive is created`, () => {
          setupTest({ touched: true });
          expectFormErrorToExist();
        });
      });

      describe('error message invoking events', () => {
        beforeEach(() => {
          setupTest({ initialFormValue: 'some-value' });
        });

        it(`should not render error message of invalid but yet untouched
 form control`, () => {
          expectFormErrorNotToExist();
        });

        it(`should append class to form error element`, () => {
          formControl.setValue(undefined, { emitEvent: false });
          formControl.markAsTouched();
          spectator.detectChanges();
          expect(spectator.query(MatError, { read: ElementRef }).nativeElement).toHaveClass(formErrorClass);
        });

        it(`should render highest priority error message under invalid
 form control on blur event from element of that form control`, () => {
          formControl.setValue(undefined, { emitEvent: false });
          spectator.focus('input');
          spectator.blur('input');
          expectFormErrorToExist();
          expect(getHighestPriorityMessageSpy).toHaveBeenCalledWith({ required: true }, undefined);
        });

        it(`should render highest priority error message of touched valid
 form control that becomes invalid`, () => {
          formControl.markAsTouched();
          spectator.detectChanges();
          expectFormErrorNotToExist();
          formControl.setValue(undefined);
          spectator.detectChanges();
          expectFormErrorToExist();
        });

        it(`should render highest priority error message of untouched invalid
 form control that becomes touched`, () => {
          formControl.setValue(undefined);
          spectator.detectChanges();
          expectFormErrorNotToExist();
          formControl.markAsTouched();
          spectator.detectChanges();
          expectFormErrorToExist();
        });

        it(`should hide error message of touched invalid form control that
 becomes valid`, () => {
          formControl.markAsTouched();
          formControl.setValue(undefined);
          spectator.detectChanges();
          expectFormErrorToExist();
          formControl.setValue('some-other-value');
          spectator.detectChanges();
          expectFormErrorNotToExist();
        });

        it(`should hide error message of touched invalid form control that
 becomes untouched`, () => {
          formControl.markAsTouched();
          formControl.setValue(undefined);
          spectator.detectChanges();
          expectFormErrorToExist();
          formControl.markAsUntouched();
          spectator.detectChanges();
          expectFormErrorNotToExist();
        });

        it(`should render highest priority error message of touched invalid
 form control only after its async validator returns error object`, fakeAsync(() => {
          const expectErrorMessageToExistAfterAsyncValidation = (): void => {
            spectator.tick(2999);
            expectFormErrorNotToExist();
            spectator.tick(1);
            expectFormErrorToExist();
          };

          formControl.clearValidators();
          formControl.setAsyncValidators(AppendFormErrorTestUtils.asyncRequired(3000));

          formControl.setValue(undefined);
          formControl.markAsTouched();
          expectErrorMessageToExistAfterAsyncValidation();

          formControl.updateValueAndValidity();
          expectErrorMessageToExistAfterAsyncValidation();
        }));

        it(`should render highest priority error message of touched invalid
 disabled form control only after it becomes enabled`, () => {
          formControl.setValue(undefined);
          formControl.markAsTouched();
          spectator.detectChanges();
          expectFormErrorToExist();
          formControl.disable();
          spectator.detectChanges();
          expectFormErrorNotToExist();
          formControl.enable();
          spectator.detectChanges();
          expectFormErrorToExist();
        });
      });

      describe('custom error message', () => {
        it(`should use custom error message when customErrors were provided`, () => {
          const customErrors = {
            required: { priority: 10, translationKey: 'customTranslation' }
          };

          setupTest({ customErrors });
          formControl.markAllAsTouched();

          expect(getHighestPriorityMessageSpy).toHaveBeenCalledWith({ required: true }, customErrors);
        });
      });
    });
  });
});
