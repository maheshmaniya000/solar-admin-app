import { formatNumber } from '@angular/common';
import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';


/**
 * Transform reactive forms number input
 * If clicked, display form field as number
 * If not clicked, display form field as text with format 0,0[...]
 *
 * TODO: for now just 'en' locale
 */
@Directive({ selector: '[sgInputLocaleFormatter]' })
export class InputLocaleFormatterDirective implements OnInit {

  private el: HTMLInputElement;
  private isFocused: boolean;

  constructor(
    private readonly elementRef: ElementRef,
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.transformFromNumberToText();
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(): void {
    this.isFocused = true;
    this.transformFromTextToNumber();
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(): void {
    this.isFocused = false;
    this.transformFromNumberToText();
  }

  @HostListener('input', ['$event'])
  onChange(): void {
    if (!this.isFocused) {
      this.transformFromNumberToText();
    }
  }

  transformFromNumberToText(): void {
    const value = parseFloat(this.el.value);
    this.el.type = 'text';
    this.el.value = isNaN(value) ? '' : formatNumber(value, 'en', '1.0-20');
  }

  transformFromTextToNumber(): void {
    const value = this.el.value.replace(',', '');
    this.el.type = 'number';
    this.el.value = value;
  }

}
