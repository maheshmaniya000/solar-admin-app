import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { MatMomentDateAdapterOptions, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Moment } from 'moment';
import { Subscription } from 'rxjs';

import { DateTimeSettings } from '@solargis/types/user-company';

import { DateTimeFormatService } from './date-time-format.service';


@Injectable()
export class DatepickerFormatAdapter extends MomentDateAdapter implements OnDestroy {
  dateTimeFormat: DateTimeSettings;
  subscription: Subscription;

  constructor(
    private readonly service: DateTimeFormatService,
    @Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string,
    @Optional() @Inject(MAT_MOMENT_DATE_ADAPTER_OPTIONS) options?: MatMomentDateAdapterOptions
  ) {
    super(dateLocale, options);
    this.subscription = service.selectDateTimeFormat().subscribe(dateTimeFormat => this.dateTimeFormat = dateTimeFormat);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  parse(value: any, parseFormat: string | string[]): Moment | null {
      const dateFormat: string | string[] = this.dateTimeFormat?.dateFormat?.toUpperCase() ?? parseFormat;
      return super.parse(value, dateFormat);
  }

  format(date: Moment, displayFormat: string): string {
      const dateFormat = this.dateTimeFormat?.dateFormat?.toUpperCase() ?? displayFormat;
      return super.format(date, dateFormat);
  }
}
