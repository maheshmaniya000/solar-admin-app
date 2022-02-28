import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { DateTimeSettings } from '@solargis/types/user-company';

import { SettingsDateTimeFormat } from '../actions/settings.actions';
import { State } from '../reducers';
import { selectDateTimeFormat } from '../selectors/settings.selector';
import { DateTimeFormatService } from './date-time-format.service';

export class DateTimeFormatNgrxService implements DateTimeFormatService {

  private readonly dateTimeFormat$: Observable<DateTimeSettings>;

  constructor(private readonly store: Store<State>) {
    this.dateTimeFormat$ = store.pipe(selectDateTimeFormat);
  }

  selectDateTimeFormat(): Observable<DateTimeSettings> {
    return this.dateTimeFormat$;
  }

  dispatchDateTimeFormat(payload: DateTimeSettings): void {
    this.store.dispatch(new SettingsDateTimeFormat(payload));
  }

}
