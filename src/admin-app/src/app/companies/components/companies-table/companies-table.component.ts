import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Store } from '@ngrx/store';
import { sortBy } from 'lodash-es';
import { isEmpty } from 'lodash-es';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, switchMap, tap } from 'rxjs/operators';

import { Page } from '@solargis/types/api';
import { Company, CompanyListFilter, Country } from '@solargis/types/user-company';

import { SubscriptionAutoCloseComponent } from 'ng-shared/shared/components/subscription-auto-close.component';
import { filterByName } from 'ng-shared/shared/utils/filter.utils';
import { CompanyService } from 'ng-shared/user/services/company.service';

import { fromDateFilterValues, materialSortToSort, toISO8601FilterValues } from '../../../shared/admin.utils';
import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { fromAdmin } from '../../../store';
import { CompaniesActions, CompaniesSelectors } from '../../store';

@Component({
  selector: 'sg-admin-companies-table',
  styleUrls: [
    '../../../shared/components/admin-common.styles.scss',
    '../../../shared/components/admin-tab.styles.scss',
    './companies-table.component.scss'
  ],
  templateUrl: './companies-table.component.html'
})
export class CompaniesTableComponent extends SubscriptionAutoCloseComponent implements OnInit {
  pageSizeOptions = [25, 50, 100];
  columns = ['checkbox', 'sgCompanyId', 'name', 'country', 'city', 'street', 'contacts', 'created', 'updated'];
  count$: Observable<number>;
  page$: Observable<Page>;

  multiselect$: Observable<string[]>;
  allSelected$: Observable<boolean>;
  companies$: Observable<Company[]>;
  selected$: Observable<Company>;

  form: FormGroup;
  countryFormControl: FormControl;
  filteredCountries$: Observable<Country[]>;
  selection = new SelectionModel<string>(true);
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly companyService: CompanyService,
    private readonly detailNavigationService: DetailNavigationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.store.dispatch(CompaniesActions.loadCompanies());
    this.companies$ = this.store.select(CompaniesSelectors.selectAll);
    this.page$ = this.store.select(CompaniesSelectors.selectPage);
    this.count$ = this.store.select(CompaniesSelectors.selectCount);

    this.selected$ = this.store.select(CompaniesSelectors.selectSelected);
    this.multiselect$ = this.store.select(CompaniesSelectors.selectMultiselect);
    this.allSelected$ = this.store.select(CompaniesSelectors.selectAllSelected);
    this.addSubscription(
      this.multiselect$.subscribe(selection => isEmpty(selection) ? this.selection.clear() : this.selection.select(...selection))
    );
    this.addSubscription(this.selection.changed.pipe(
      distinctUntilChanged(isEqual)
    ).subscribe(() => this.store.dispatch(CompaniesActions.multiselect({ ids: this.selection.selected }))));
    this.store
      .select(CompaniesSelectors.selectFilter)
      .pipe(first())
      .subscribe(filter => this.patchForm(filter));
    this.form.valueChanges.pipe(debounceTime(250)).subscribe(() => {
      this.store.dispatch(CompaniesActions.changeFilter({ filter: this.getFilter() }));
    });
    this.filteredCountries$ = this.countryFormControl.valueChanges.pipe(
      debounceTime(250),
      tap(countryFilter =>
        isEmpty(countryFilter) ? this.store.dispatch(CompaniesActions.changeFilter({ filter: { country: undefined } })) : null
      ),
      switchMap(countryFilter => this.filterCountries(countryFilter))
    );
    this.store.select(CompaniesSelectors.selectSort).subscribe(sort => {
      this.sort.active = sort.sortBy;
      this.sort.direction = sort.direction;
    });
    this.sort.sortChange.subscribe(materialSort =>
      this.store.dispatch(CompaniesActions.changeSort({ sort: materialSortToSort(materialSort) }))
    );
  }

  onCountrySelected($event: MatAutocompleteSelectedEvent): void {
    this.store.dispatch(CompaniesActions.changeFilter({ filter: { country: $event.option.value.code } }));
  }

  filterCountries(countryFilter?: string): Observable<Country[]> {
    return this.companyService.listCountries().pipe(
      first(),
      map(countries => sortBy(filterByName(countries, countryFilter), ({ name }) => name))
    );
  }

  onPageChanged(event: PageEvent): void {
    this.store.dispatch(CompaniesActions.changePage({ page: { size: event.pageSize, index: event.pageIndex } }));
  }

  onRowClicked(company: Company): void {
    this.detailNavigationService.toCompany(company);
  }

  onSelectAllClick(event: MouseEvent): void {
    event.preventDefault();
    this.store.dispatch(this.selection.hasValue() ? CompaniesActions.multiselectClear() : CompaniesActions.multiselectToggleAll());
  }

  countryDisplayFn(country?: Country): string | undefined {
    return country?.name;
  }

  private createForm(): void {
    const fb = new FormBuilder();
    this.form = fb.group({
      sgCompanyId: [undefined],
      name: [undefined],
      city: [undefined],
      street: [undefined],
      zipCode: [undefined],
      contactEmail: [undefined],
      created: new FormBuilder().group({
        start: [undefined],
        end: [undefined]
      }),
      updated: new FormBuilder().group({
        start: [undefined],
        end: [undefined]
      })
    });
    this.countryFormControl = new FormControl();
  }

  private patchForm(filter: CompanyListFilter): void {
    this.form.patchValue(
      { ...filter, created: fromDateFilterValues(filter?.created), updated: fromDateFilterValues(filter?.updated) },
      { emitEvent: false }
    );
    this.companyService
      .findCountryByCode(filter.country)
      .pipe(first())
      .subscribe(country => this.countryFormControl.setValue(country, { emitEvent: false }));
  }

  private getFilter(): CompanyListFilter {
    return {
      sgCompanyId: this.form.get('sgCompanyId').value?.trim(),
      name: this.form.get('name').value?.trim(),
      city: this.form.get('city').value?.trim(),
      street: this.form.get('street').value?.trim(),
      zipCode: this.form.get('zipCode').value?.trim(),
      contactEmail: this.form.get('contactEmail').value?.trim(),
      created: toISO8601FilterValues(this.form.get('created').value),
      updated: toISO8601FilterValues(this.form.get('updated').value)
    };
  }
}
