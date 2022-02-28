import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PvConfig, PvConfigStatus, NoPvSystem } from '@solargis/types/pv-config';

import { selectSelectedEnergySystem } from 'ng-project/project-detail/selectors';
import { State } from 'ng-project/project/reducers';
import { mapPvConfigStatus } from 'ng-project/project/utils/map-pv-config-status.operator';

@Component({
  selector: 'sg-pv-configuration',
  templateUrl: './pv-configuration.component.html',
  styleUrls: ['./pv-configuration.component.scss']
})
export class PvConfigurationComponent implements OnInit {

  pvConfig$: Observable<PvConfig>;
  pvConfigStatus$: Observable<PvConfigStatus>;
  isLoading$: Observable<boolean>;

  constructor(private readonly route: ActivatedRoute, private readonly store: Store<State>) { }

  ngOnInit(): void {
    this.pvConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && system.pvConfig || NoPvSystem)
    );

    this.pvConfigStatus$ = this.store.pipe(
      selectSelectedEnergySystem,
      mapPvConfigStatus()
    );

    this.isLoading$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => !!(system && system.progress && (system.progress.update || system.progress.save)))
    );
  }

}
