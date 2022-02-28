import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DateTimeSettings } from '@solargis/types/user-company';

@Injectable()
export abstract class DateTimeFormatService {

  abstract selectDateTimeFormat(): Observable<DateTimeSettings>;

  abstract dispatchDateTimeFormat(payload: DateTimeSettings): void;

}
