import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DateTimeSettings } from '@solargis/types/user-company';

import { DateTimeFormatService } from 'ng-shared/core/services/date-time-format.service';

@Injectable()
export class DateTimeFormatPlainService implements DateTimeFormatService {

  private readonly dateTimeFormat$ = new BehaviorSubject<DateTimeSettings>({ dateFormat: 'yyyy-MM-dd' });

  selectDateTimeFormat(): Observable<DateTimeSettings> {
    return this.dateTimeFormat$;
  }

  dispatchDateTimeFormat(payload: DateTimeSettings): void {
    const old = this.dateTimeFormat$.getValue();
    this.dateTimeFormat$.next({ ...old, ...payload });
  }

}
