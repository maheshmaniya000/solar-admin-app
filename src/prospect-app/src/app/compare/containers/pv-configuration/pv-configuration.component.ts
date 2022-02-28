import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { State } from 'ng-project/project/reducers';
import { selectCompareItems } from 'ng-project/project/selectors/compare.selectors';
import { CompareItem } from 'ng-project/project/types/compare.types';

@Component({
  selector: 'sg-pv-configuration',
  templateUrl: './pv-configuration.component.html',
  styleUrls: ['./pv-configuration.component.scss']
})
export class PvConfigurationComponent implements OnInit {
  compare$: Observable<CompareItem[]>;

  constructor(public store: Store<State>) {}

  ngOnInit(): void {
    this.compare$ = this.store.pipe(selectCompareItems);
  }

}
