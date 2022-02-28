import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, publishReplay, refCount } from 'rxjs/operators';

import { economyCalculator, EconomyCalculatorOutput, getEconomyCalculatorDefaults } from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { EnergySystem, Project } from '@solargis/types/project';
import { SystemConfig } from '@solargis/types/pvlib';

import { State } from 'ng-project/project-detail/reducers';
import {
  selectSelectedEnergySystem, selectSelectedEnergySystemData, selectSelectedEnergySystemProject
} from 'ng-project/project-detail/selectors';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';

import { selectSelectedSystemEconomyParameters } from '../../selectors/economy.selectors';


@Component({
  selector: 'sg-economy-calculator-results',
  templateUrl: './economy-calculator-results.component.html',
  styleUrls: ['./economy-calculator-results.component.scss']
})
export class EconomyCalculatorResultsComponent implements OnInit {

  project$: Observable<Project>;
  economy$: Observable<EconomyCalculatorOutput>;
  yearsOfOperation$: Observable<number>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store<State>
  ) {}

  ngOnInit(): void {
    this.project$ = this.store.pipe(selectSelectedEnergySystemProject);
    const economy$ = this.store.pipe(selectSelectedSystemEconomyParameters);

    const defaults$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(energySystem => getEconomyCalculatorDefaults(energySystem as EnergySystem)),
      first()
    );

    const parameters$ = combineLatest([
      economy$,
      defaults$
    ]).pipe(
      map(([economy, defaults]) => {
        if (!economy) {
          return defaults;
        } else {
          return economy;
        }
      }),
      filter(parameters => !!parameters),
      publishReplay(),
      refCount()
    );

    const pvoutAnnual$: Observable<AnnualDataMap> = this.store.pipe(
      selectSelectedEnergySystemData,
      mapDatasetData('pvcalc', 'annual'),
      filter(Boolean)
    ) as Observable<AnnualDataMap>;

    this.yearsOfOperation$ = parameters$.pipe(map(params => params.yearsOfOperation));

    const pvRequest$: Observable<SystemConfig> = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && system.pvRequest)
    );

    this.economy$ = combineLatest([parameters$, pvoutAnnual$, pvRequest$]).pipe(
      map(([parameters, pvoutAnnual, pvRequest]) => economyCalculator(
        parameters,
        pvoutAnnual,
        pvRequest,
      ))
    );
  }

  back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
