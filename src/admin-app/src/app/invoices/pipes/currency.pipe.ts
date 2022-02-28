import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sgCurrency',
  pure: false
})
export class CurrencyPipe implements PipeTransform {

  constructor(private readonly decimalPipe: DecimalPipe) {}

  transform(value: number, currency: string): string {
    const summaryValue = this.decimalPipe.transform(value, '1.2-2', 'en');

    return currency === '$' ? `${currency} ${summaryValue}` : `${summaryValue} ${currency}`;
  }
}
