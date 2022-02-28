import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  publishReplay,
  refCount,
  skip,
  startWith,
  switchMap,
  withLatestFrom
} from 'rxjs/operators';

import { Dataset } from '@solargis/dataset-core';
import {
  calculateEconomyParameters,
  calculateEconomyStats,
  economyCalculator,
  EconomyCalculatorOutput,
  economyInputLayers,
  economyLayersMap,
  economyOutputLayers,
  EconomyParameters,
  getEconomyCalculatorDefaults
} from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { EconomyInput } from '@solargis/types/economy';
import { EnergySystem } from '@solargis/types/project';
import { SystemConfig } from '@solargis/types/pvlib';
import { Unit } from '@solargis/units';

import {
  selectSelectedEnergySystem,
  selectSelectedEnergySystemData,
  selectSelectedEnergySystemMetadataLatest,
  selectSelectedEnergySystemRef
} from 'ng-project/project-detail/selectors';
import { EnergySystemUpdate } from 'ng-project/project/actions/energy-systems.actions';
import { State } from 'ng-project/project/reducers';
import { PVCALC_DATASET } from 'ng-project/project/services/pvcalc-dataset.factory';
import { mapDatasetData } from 'ng-project/project/utils/map-dataset-data.operator';
import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';

import { EconomyTariffDialogComponent } from '../../components/economy-tariff-dialog/economy-tariff-dialog.component';
import { selectSelectedSystemEconomyParameters } from '../../selectors/economy.selectors';

const inputPriceTypes = ['feedInTariff', 'powerPurchaseAgreement', 'netMetering'];

@Component({
  selector: 'sg-economy-calculator',
  templateUrl: './economy-calculator.component.html',
  styleUrls: ['./economy-calculator.component.scss']
})
export class EconomyCalculatorComponent extends SubscriptionAutoCloseComponent implements OnInit {
  isChanged = false;

  systemConfig$: Observable<SystemConfig>;
  pvcalcAnnual$: Observable<AnnualDataMap>;

  economy$: Observable<EconomyCalculatorOutput>;

  parameters$: Observable<EconomyParameters>;
  hasLoan$ = new BehaviorSubject<boolean>(false);
  readonly$: Observable<boolean>;

  stats$: Observable<{ [key: string]: number }>;
  payback$: Observable<number>;

  inputPriceTypes = inputPriceTypes;

  form: FormGroup;
  formValues$: Observable<EconomyInput>;

  layers = economyLayersMap;

  inputLayers = economyInputLayers;
  outputLayers = economyOutputLayers;

  constructor(
    private readonly store: Store<State>,
    private readonly dialog: MatDialog,
    private readonly fb: FormBuilder,
    @Inject(PVCALC_DATASET) public pvcalcDataset: Dataset
  ) {
    super();
  }

  ngOnInit(): void {
    this.systemConfig$ = this.store.pipe(
      selectSelectedEnergySystem,
      map(system => system && system.pvRequest)
    );

    this.readonly$ = this.store.select(selectSelectedEnergySystemMetadataLatest('prospect')).pipe(map(latest => !latest));

    this.form = this.fb.group({
      tariff: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      tariffIndexationRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],

      installationCosts: [undefined, [Validators.required, Validators.min(0), Validators.max(50000000000)]],
      incentiveOrRebate: [undefined, [Validators.required, Validators.min(0), Validators.max(5000000000)]],

      inverterReplacementCost: [0, [Validators.required, Validators.min(0), Validators.max(500000000)]],

      loan: [undefined, [Validators.required, Validators.min(0), Validators.max(1000000000)]],
      loanInterestRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      loanPeriod: [undefined, [Validators.required,Validators.min(1), Validators.max(100)]],

      annualOperationalCost: [undefined, [Validators.required, Validators.min(0), Validators.max(1000000000)]],
      maintenanceReserve: [undefined, [Validators.required, Validators.min(0), Validators.max(1000000000)]],
      inverterReplacementYear: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],

      linearDeprecationPeriod: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      discountRate: [0, [Validators.required, Validators.min(0), Validators.max(500000000)]],
      taxesOnProfit: [0, [Validators.required, Validators.min(0), Validators.max(500000000)]],

      // eslint-disable-next-line @typescript-eslint/naming-convention
      OPEXInflationRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],

      yearsOfOperation: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
    this.addSubscription(this.readonly$.subscribe(readonly => readonly ? this.form.disable() : this.form.enable()));

    this.resetInitialValues();

    // merge inputs from form and hasLoan
    this.formValues$ = combineLatest(
      this.form.valueChanges.pipe(
        filter(() => this.form.valid || this.form.pristine),
        startWith(this.form.value)
      ),
      this.hasLoan$
    ).pipe(
      map(([inputs, hasLoan]) => {
        inputs = { ...inputs };
        inputs.hasLoan = hasLoan;
        return inputs;
      }),
      distinctUntilChanged(isEqual),
      publishReplay(),
      refCount()
    );

    this.addSubscription(
      this.formValues$
        .pipe(debounceTime(50), skip(1))
        .subscribe(() => (this.isChanged = true))
    );

    // calculate params displayed in form
    this.parameters$ = combineLatest(
      this.formValues$,
      this.systemConfig$.pipe(map(c => c.pvInstalledPower))
    ).pipe(
      map(([inputs, pvInstalledPower]) => calculateEconomyParameters(inputs, pvInstalledPower)),
      publishReplay(),
      refCount()
    );

    this.pvcalcAnnual$ = this.store.pipe(
      selectSelectedEnergySystemData,
      mapDatasetData('pvcalc', 'annual'),
      filter(pvcalcAnnual => !!pvcalcAnnual)
    );

    this.economy$ = combineLatest(
      this.formValues$,
      this.pvcalcAnnual$,
      this.systemConfig$
    ).pipe(
      map(([form, pvout, systemConfig]) => economyCalculator(form, pvout, systemConfig)),
      publishReplay(),
      refCount()
    );

    this.stats$ = this.economy$.pipe(
      map(economy => calculateEconomyStats(economy)),
      publishReplay(),
      refCount()
    );
  }

  resetInitialValues(): void {
    this.getInitialValues().subscribe(initialValues => {
      this.setValues(initialValues);
      this.isChanged = false;
    });
  }

  resetDefaultValues(): void {
    this.getDefaultValues().subscribe(defaults => {
      this.setValues(defaults);
      this.isChanged = true;
    });
  }

  toggleLoan(): void {
    this.hasLoan$.next(!this.hasLoan$.value);
  }

  unit(key: string): Unit {
    const layer = economyLayersMap.get(key);
    return layer && layer.unit;
  }

  tariffGoalseek(): void {
    combineLatest(this.formValues$, this.pvcalcAnnual$, this.systemConfig$)
      .pipe(
        first(),
        switchMap(([inputs, pvcalcAnnual, systemConfig]) =>
          this.dialog
            .open(EconomyTariffDialogComponent, {
              data: { inputs, pvcalcAnnual, systemConfig },
              maxWidth: 500
            })
            .afterClosed()
        ),
        filter(Boolean)
      )
      .subscribe(dialogTariffResult => {
        this.form.controls.tariff.setValue(dialogTariffResult);
      });
  }

  saveValues(): void {
    this.store
      .pipe(
        selectSelectedEnergySystemRef,
        withLatestFrom(this.formValues$),
        first()
      )
      .subscribe(([energySystemRef, economy]) => {
        this.store.dispatch(new EnergySystemUpdate({ systemRef: energySystemRef, update: { economy } }));
        this.isChanged = false;
      });
  }

  private getInitialValues(): Observable<EconomyInput> {
    return this.store.pipe(
      selectSelectedSystemEconomyParameters,
      switchMap(values => (values ? of(values) : this.getDefaultValues())),
      first()
    );
  }

  private getDefaultValues(): Observable<EconomyInput> {
    return this.store.pipe(
      selectSelectedEnergySystem,
      map(energySystem =>
        getEconomyCalculatorDefaults(energySystem as EnergySystem)
      ),
      first()
    );
  }

  private setValues(values: EconomyInput): void {
    this.hasLoan$.next(values.hasLoan || false);
    this.form.patchValue(values, { onlySelf: false, emitEvent: true });
  }
}
