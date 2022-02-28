import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import {
  calculateEconomyParameters,
  calculateEconomyStats,
  economyCalculator,
  economyParameterUnits
} from '@solargis/prospect-detail-calc';
import { hasPvConfig } from '@solargis/types/project';
import { range } from '@solargis/types/utils';

import { State } from 'ng-project/project/reducers';
import { selectCompareItems } from 'ng-project/project/selectors/compare.selectors';
import { CompareItem } from 'ng-project/project/types/compare.types';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { selectCompareEnergySystemData } from '../../selectors/compare.selectors';
import { hasEconomyConfig } from '../../utils/energy-system.utils';

export const strrange = (x: number): string[] => range(x).map(i => i.toString());

@Component({
  selector: 'sg-economy',
  templateUrl: './economy.component.html',
  styleUrls: ['./economy.component.scss']
})
export class EconomyComponent extends SubscriptionAutoCloseComponent implements OnInit {

  compare: CompareItem[];
  hasCompareItems$: Observable<boolean>;

  columns = [];
  economyInputsDataSource$: Observable<any>;
  economyOutputsDataSource$: Observable<any>;

  hasData: boolean;

  dataSources = {};

  constructor(public store: Store<State>) {
    super();
  }

  ngOnInit(): void {
    const compare$ = this.store.pipe(
      selectCompareItems,
      map(items => items.filter(item => hasPvConfig(item.energySystem) && hasEconomyConfig(item.energySystem))),
    );

    this.addSubscription(
      compare$.subscribe(
        compare => {
          this.compare = compare;
          this.columns = ['label', 'unit', ...strrange(compare.length)];
        }
      )
    );

    this.hasCompareItems$ = compare$.pipe(
      map(items => !!items && items.length > 0)
    );

    const pvoutAnnualData$ = this.store.pipe(
      selectCompareEnergySystemData,
      map(data => Object.keys(data).reduce(
        (acc, key) => {
          acc[key] = data[key] && data[key].annual ? data[key].annual.data : 0;
          return acc;
        }, {}
      )),
    );

    const economy$ = combineLatest([
      compare$,
      pvoutAnnualData$
    ]).pipe(
      debounceTime(20),
      map(([compare, data]) => compare.map(
        item => {
          const economy = economyCalculator(
            item.energySystem.economy,
            data[item.energySystemId],
            item.energySystem.pvRequest
          );
          return {
            ...item,
            economyParams: calculateEconomyParameters(item.energySystem.economy, item.energySystem.pvRequest.pvInstalledPower),
            economyStats: calculateEconomyStats(economy),
          };
        }
      )),
    );

    this.economyInputsDataSource$ = economy$.pipe(
      debounceTime(20),
      map(items => {
        const hasLoan = (i: any): boolean => i.energySystem.economy.hasLoan;

        return [{
          label: 'projectDetail.economy.layer.tariff.name',
          unit: economyParameterUnits.tariff,
          ...(items.map(i => i.energySystem.economy.tariff)),
          bold: true
        },
        null,
        {
          label: 'pvConfig.params.systemSize.capacity',
          unit: economyParameterUnits.installedPower,
          ...(items.map(i => i.energySystem.pvRequest.pvInstalledPower))
        }, {
          label: 'projectDetail.economy.form.installationCost',
          unit: economyParameterUnits.installationCosts,
          ...(items.map(i => i.energySystem.economy.installationCosts))
        }, {
          label: 'projectDetail.economy.layer.unitSystemCosts.name',
          unit: economyParameterUnits.unitSystemCosts,
          ...(items.map(i => i.economyParams.unitSystemCosts)),
          bold: true
        },
        null,
        {
          label: 'projectDetail.economy.layer.incentiveOrRebate.name',
          unit: economyParameterUnits.incentiveOrRebate,
          ...(items.map(i => i.energySystem.economy.incentiveOrRebate))
        }, {
          label: 'projectDetail.economy.layer.CAPEX.name',
          unit: economyParameterUnits.CAPEX,
          ...(items.map(i => i.economyParams.CAPEX)),
          bold: true
        },
        null,
        {
          label: 'projectDetail.economy.form.loan',
          unit: economyParameterUnits.loan,
          ...(items.map(i => hasLoan(i) ? i.energySystem.economy.loan : null))
        }, {
          label: 'projectDetail.economy.form.loanEquity',
          unit: economyParameterUnits.loanEquity,
          ...(items.map(i => hasLoan(i) ? i.economyParams.loanEquity : null)),
          bold: true
        }, {
          label: 'projectDetail.economy.layer.loanDebtToEquity.name',
          unit: economyParameterUnits.loanDebtToEquity,
          ...(items.map(i => hasLoan(i) ? i.economyParams.loanDebtToEquity: null))
        }, {
          label: 'projectDetail.economy.form.interestRate',
          unit: economyParameterUnits.loanInterestRate,
          ...(items.map(i => hasLoan(i) ? i.energySystem.economy.loanInterestRate: null))
        }, {
          label: 'projectDetail.economy.form.loanPeriod',
          unit: economyParameterUnits.loanPeriod,
          ...(items.map(i => hasLoan(i) ? i.energySystem.economy.loanPeriod : null))
        },
        null,
        {
          label: 'projectDetail.economy.layer.OPEX.name',
          unit: economyParameterUnits.OPEX,
          ...(items.map(i => i.economyParams.OPEX)),
          bold: true
        },
        null,
        {
          label: 'projectDetail.economy.layer.discountRate.name',
          unit: economyParameterUnits.discountRate,
          ...(items.map(i => i.energySystem.economy.discountRate)),
          bold: true
        }, {
          label: 'projectDetail.economy.layer.taxesOnProfit.name',
          unit: economyParameterUnits.taxesOnProfit,
          ...(items.map(i => i.energySystem.economy.taxesOnProfit))
        }, {
          label: 'projectDetail.economy.form.linearDeprecation',
          unit: economyParameterUnits.linearDeprecationPeriod,
          ...(items.map(i => i.energySystem.economy.linearDeprecationPeriod))
        },
        null,
        {
          label: 'projectDetail.economy.form.yearsOfOperation',
          unit: economyParameterUnits.yearsOfOperation,
          ...(items.map(i => i.energySystem.economy.yearsOfOperation)),
          bold: true
        }, {
          label: 'pvConfig.params.systemAvailability.headline',
          unit: economyParameterUnits.systemAvailability,
          ...(items.map(i => i.energySystem.pvRequest.pvAvailabilityYearly))
        }];
      })
    );

    this.economyOutputsDataSource$ = economy$.pipe(
      map(items => [{
          label: 'projectDetail.economy.layer.IRRProject.name',
          unit: economyParameterUnits.IRRProject,
          ...(items.map(i => !isNaN(i.economyStats.IRRProject) ? i.economyStats.IRRProject : null))
        }, {
          label: 'projectDetail.economy.layer.IRREquity.name',
          unit: economyParameterUnits.IRREquity,
          ...(items.map(i => !isNaN(i.economyStats.IRREquity) ? i.economyStats.IRREquity : null)),
          bold: true
        },{
          label: 'projectDetail.economy.layer.ROIEquity.name',
          unit: economyParameterUnits.ROIEquity,
          ...(items.map(i => !isNaN(i.economyStats.ROIEquity) ? i.economyStats.ROIEquity : null))
        }, {
          label: 'projectDetail.economy.layer.LCOE.name',
          unit: economyParameterUnits.LCOE,
          ...(items.map(i => !isNaN(i.economyStats.LCOE) ? i.economyStats.LCOE : null)),
          bold: true
        }])
    );
  }

}
