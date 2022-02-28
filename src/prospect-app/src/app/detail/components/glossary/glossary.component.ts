import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { DataLayer } from '@solargis/dataset-core';

import { State } from 'ng-project/project-detail/reducers';
import { LayoutGlossaryToggle } from 'ng-shared/core/actions/layout.actions';

@Component({
  selector: 'sg-glossary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './glossary.component.html'
})
export class GlossaryComponent implements OnChanges {
  @Input() layers: DataLayer[];
  @Input() noAcronym = false;
  @Input() noSort = false;

  opened$: Observable<boolean>;

  constructor(private readonly store: Store<State>) {}

  ngOnChanges(): void {
    this.opened$ = this.store.select('layout').pipe(
      map(layout => layout.glossary === 'opened'),
      distinctUntilChanged()
    );
  }

  setClosed(closed: boolean): void {
    const glossary = closed ? 'closed' : 'opened';
    this.store.dispatch(new LayoutGlossaryToggle(glossary));
  }

}
