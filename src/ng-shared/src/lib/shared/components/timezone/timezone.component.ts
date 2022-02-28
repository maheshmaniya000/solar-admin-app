import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { getPrintableTimezone, Timezone } from '@solargis/types/site';


@Component({
  selector: 'sg-timezone',
  templateUrl: './timezone.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezoneComponent implements OnChanges {

  @Input() timezone: Timezone;

  timezone$ = new BehaviorSubject<any>(null);
  timezoneString$: Observable<string>;

  constructor(private readonly transloco: TranslocoService) {
    const dstNotConsidered$ = this.transloco.selectTranslate('project.timezone.dstNotConsidered');

    this.timezoneString$ = combineLatest(
      dstNotConsidered$,
      this.timezone$.pipe(filter(x => !!x))
    ).pipe(
      map(([dstNotConsidered, timezone]) => getPrintableTimezone(timezone, dstNotConsidered))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timezone) {
      this.timezone$.next(this.timezone);
    }
  }
}
