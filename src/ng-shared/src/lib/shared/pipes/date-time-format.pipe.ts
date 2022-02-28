import { DatePipe } from '@angular/common';
import { Inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

import { DateTimeSettings } from '@solargis/types/user-company';

import { DateTimeFormatService } from '../../core/services/date-time-format.service';

@Pipe({ name: 'sgDateTimeFormat', pure: false })
export class DateTimeFormatPipe implements PipeTransform, OnDestroy {
  dateTimeFormat: DateTimeSettings;
  subscription: Subscription;

  constructor(@Inject(DateTimeFormatService) service: DateTimeFormatService, private readonly datePipe: DatePipe) {
    this.subscription = service.selectDateTimeFormat()
      .subscribe(dateTimeFormat => this.dateTimeFormat = dateTimeFormat);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  transform(value: number | string | Date, format?: string): Date | string {
    if (!value) {return null;}
    if (typeof value === 'string' && isNaN(Date.parse(value))) {return value;} // catch invalid date expressions
    const date = moment(value).toDate();

    return this.datePipe.transform(date, format === 'dateTime'
      ? `${this.dateTimeFormat.dateFormat} ${this.dateTimeFormat.timeFormat}`
      : this.dateTimeFormat.dateFormat
    );
  }

}
