import { Directive, HostListener, ElementRef, OnInit, OnDestroy, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { getToggleKeys$ } from '@solargis/ng-unit-value';
import { Unit, resolveUnitValue, resolveBackUnitValue } from '@solargis/units';

import { State } from '../../core/reducers';
import { selectUnitToggle } from '../../core/selectors/settings.selector';
import { SubscriptionAutoCloseComponent } from '../components/subscription-auto-close.component';


@Directive({
  selector: '[sgUnitValueInput]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // eslint-disable-next-line no-use-before-define
    useExisting: forwardRef(() => UnitValueInputDirective),
    multi: true
  }]
})
export class UnitValueInputDirective extends SubscriptionAutoCloseComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @Input() unit: Unit;

  toggleKeys$: Observable<any>;

  originalValue: number;

  private el: HTMLInputElement;

  onTouched: () => void;
  onChange: (value: number) => void;

  constructor(
    private readonly store: Store<State>,
    private readonly elementRef: ElementRef,
  ) {
    super();
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.originalValue = parseFloat(this.el.value);
    this.toggleKeys$ = getToggleKeys$(this.unit, this.store.pipe(selectUnitToggle));

    /**
     * When toggle changes, push value to form
     */
    this.addSubscription(
      this.toggleKeys$.pipe(
        map(([, toggleKeys]) => resolveBackUnitValue(this.unit, this.originalValue, toggleKeys, { noFormat: true })),
      ).subscribe(transformedValue => {
        this.writeValue(transformedValue);
      })
    );
  }

  /**
   * Push transformed value to form
   *
   * @param value
   */
  writeValue(value: number): void {
    this.originalValue = value;

    this.toggleKeys$.pipe(
      map(toggleKeys => resolveUnitValue(this.unit, value, toggleKeys, { noFormat: true })),
      first()
    ).subscribe(transformedValue => {
      this.el.value = transformedValue;
    });

    this.el.dispatchEvent(new Event('input'));
  }

  /**
   * Push original value to form control on change
   */
  @HostListener('input', [ '$event.target.value' ])
  input(): void {
    const value = parseFloat(this.el.value);
    this.toggleKeys$.pipe(
      map(toggleKeys => resolveBackUnitValue(this.unit, value, toggleKeys, { noFormat: true })),
      first()
    ).subscribe(originalValue => {
      this.originalValue = isNaN(originalValue) ? '' : originalValue;
      this.onChange?.(this.originalValue);
    });
  }

  @HostListener('blur')
  blur(): void {
    this.onTouched?.();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
