import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { isEmpty, isNil, sortBy } from 'lodash-es';
import { combineLatest, Observable, of, timer } from 'rxjs';
import { debounceTime, filter, finalize, first, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { getVatIdPrefix, isEUCompany, VatCompanyRef } from '@solargis/types/customer';
import { CompanySnapshot, Country, State, Territory } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { isNotEmpty, isNotNil } from 'components/utils';
import { SgValidators } from 'components/validators/validators';
import { filterByName } from 'ng-shared/shared/utils/filter.utils';
import { CompanyService } from 'ng-shared/user/services/company.service';
import { listSelectionValidator, notSelectedFromListCustomErrors } from 'ng-shared/user/utils/list-selection.validator';

type EditableCompanySnapshotProps = Pick<
  CompanySnapshot,
  | 'name'
  | 'groupName'
  | 'VAT_ID'
  | 'web'
  | 'phone'
  | 'country'
  | 'state'
  | 'territory'
  | 'city'
  | 'street'
  | 'street2'
  | 'zipCode'
  | 'registrationId'
  | 'companyEmailForInvoice'
  | 'note'
>;

@Component({
  selector: 'sg-admin-company-snapshot-editor',
  styleUrls: ['../admin-common.styles.scss'],
  templateUrl: './company-snapshot-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanySnapshotEditorComponent implements OnInit {
  @Input() companySnapshot: CompanySnapshot;
  @Input() parentForm: FormGroup;

  filteredCountries$: Observable<Country[]>;
  filteredStates$: Observable<State[]>;
  filteredTerritories$: Observable<Territory[]>;
  stateRequired$: Observable<boolean>;
  territoriesAvailable$: Observable<boolean>;
  euCompany$: Observable<boolean>;
  private countries$: Observable<Country[]>;
  private countryStates$: Observable<State[]>;
  private countryTerritories$: Observable<Territory[]>;

  readonly notSelectedFromListCustomErrors = notSelectedFromListCustomErrors;
  readonly vatNoSpacesPattern: RegExp = new RegExp('^\\S*$');

  constructor(readonly companyService: CompanyService, private readonly changeDetector: ChangeDetectorRef) {}

  static createControlConfigs(): Record<keyof EditableCompanySnapshotProps, any> {
    return {
      name: [undefined, [Validators.required]],
      groupName: [undefined, []],
      VAT_ID: [undefined, []],
      web: [undefined, []],
      phone: [undefined, []],
      country: [undefined, [Validators.required, listSelectionValidator]],
      state: [undefined, []],
      territory: [undefined, []],
      city: [undefined, [Validators.required]],
      street: [undefined, []],
      street2: [undefined, []],
      zipCode: [undefined, []],
      registrationId: [undefined, []],
      companyEmailForInvoice: [undefined, []],
      note: [undefined, []]
    };
  }

  static getFormValue(formGroup: FormGroup): CompanySnapshot {
    const company: CompanySnapshot = formGroup.value;
    company.country = removeEmpty({
      ...company.country,
      states: undefined,
      territories: undefined
    });
    if (isEmpty(company.territory)) {
      company.territory = null;
    }
    return company;
  }

  ngOnInit(): void {
    this.setupForm();
  }

  getCountryFormControl(): AbstractControl {
    return this.parentForm.get('country');
  }

  getStateFormControl(): AbstractControl {
    return this.parentForm.get('state');
  }

  getTerritoryFormControl(): AbstractControl {
    return this.parentForm.get('territory');
  }

  getVatFormControl(): AbstractControl {
    return this.parentForm.get('VAT_ID');
  }

  nameDisplayFn(value?: { name: string }): string | undefined {
    return value?.name;
  }

  onCountrySelected(): void {
    this.getStateFormControl().reset();
    this.getTerritoryFormControl().reset();
    this.getVatFormControl().reset();
  }

  onTerritorySelected(): void {
    const country = this.getCountryFormControl().value as Country;
    const territory = this.getTerritoryFormControl().value as Territory;

    if (country.vatPrefix !== territory.vatPrefix) {
      this.getVatFormControl().reset();
    }
  }

  private getVatCompanyRef(): VatCompanyRef {
    return removeEmpty(
      {
        territory: this.getTerritoryFormControl().value,
        country: this.getCountryFormControl().value
      },
      false,
      true
    );
  }

  private vatValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> =>
        isNil(control.value) || control.pristine
        ? of(null)
        : timer(500).pipe(
            switchMap(() =>
              this.companyService
                .validateVatId(this.getVatCompanyRef(), control.value)
                .pipe(map(valid => (valid ? null : { vatValidation: { vatPrefix: getVatIdPrefix(this.getVatCompanyRef()) } })))
            ),
            first(),
            finalize(() => {
              control.markAsTouched();
              this.changeDetector.markForCheck();
            })
          );
  }

  private setupForm(): void {
    const countryFormControlValueChanges = this.getCountryFormControl().valueChanges.pipe(
      startWith(this.getCountryFormControl().value as Country)
    );
    const territoryFormControlValueChanges = this.getTerritoryFormControl().valueChanges.pipe(
      startWith(this.getTerritoryFormControl().value as Territory)
    );
    this.euCompany$ = combineLatest([countryFormControlValueChanges, territoryFormControlValueChanges]).pipe(
      map(() => isEUCompany(this.getVatCompanyRef())),
      shareReplay(1)
    );
    this.countries$ = this.companyService.listCountries().pipe(
      first(),
      map(countries => sortBy(countries, ({ name }) => name))
    );
    this.countryStates$ = countryFormControlValueChanges.pipe(
      filter(isNotNil),
      switchMap(country => this.companyService.findCountryByCode(country.code).pipe(first())),
      map(country => country?.states ?? []),
      map(states => sortBy(states, ({ name }) => name)),
      shareReplay(1)
    );
    this.stateRequired$ = this.countryStates$.pipe(map(isNotEmpty));
    this.getStateFormControl().setValidators(
      SgValidators.conditionalValidator(Validators.compose([Validators.required, listSelectionValidator]), this.stateRequired$)
    );
    this.countryTerritories$ = countryFormControlValueChanges.pipe(
      filter(isNotNil),
      switchMap(country => this.companyService.findCountryByCode(country.code).pipe(first())),
      map(country => country?.territories ?? []),
      map(territories => sortBy(territories, ({ name }) => name)),
      shareReplay(1)
    );
    this.territoriesAvailable$ = this.countryTerritories$.pipe(map(isNotEmpty));
    this.getTerritoryFormControl().setValidators(SgValidators.conditionalValidator(listSelectionValidator, this.territoriesAvailable$));
    this.getVatFormControl().setValidators(SgValidators.conditionalValidator(Validators.required, this.euCompany$));
    this.getVatFormControl().setAsyncValidators(SgValidators.asyncConditionalValidator(this.vatValidator(), this.euCompany$));
    this.filteredCountries$ = this.filterByName(this.getCountryFormControl().valueChanges, this.countries$);
    this.filteredStates$ = this.filterByName(this.getStateFormControl().valueChanges, this.countryStates$);
    this.filteredTerritories$ = this.filterByName(this.getTerritoryFormControl().valueChanges, this.countryTerritories$);
  }

  private filterByName<T extends { name: string }>(valueChanges: Observable<any>, source$: Observable<T[]>): Observable<T[]> {
    return valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      switchMap(value => source$.pipe(map(sourceValues => filterByName(sourceValues, value), first())))
    );
  }
}
