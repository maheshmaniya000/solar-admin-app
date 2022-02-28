import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { Company, CompanyListFilter, CompanyListResponse } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { companyRefToString } from 'ng-shared/shared/utils/company.utils';

import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../../store';
import { CompaniesActions, CompaniesSelectors } from '../../store';
import { CompaniesToolbarStore } from './companies-toolbar.store';

@Component({
  selector: 'sg-admin-companies-toolbar',
  templateUrl: './companies-toolbar.component.html',
  styleUrls: ['./companies-toolbar.component.scss'],
  providers: [CompaniesToolbarStore]
})
export class CompaniesToolbarComponent implements OnInit {
  companyRefToString = companyRefToString;

  selectedCompanies$: Observable<string[]>;
  multiselectActive$: Observable<boolean>;
  filter$: Observable<CompanyListFilter>;
  filteredCompanies$: Observable<Company[]>;

  assignCompanyToParentFormControl = new FormControl();

  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    readonly companiesToolbarStore: CompaniesToolbarStore
  ) {
  }

  ngOnInit(): void {
    this.selectedCompanies$ = this.store.select(CompaniesSelectors.selectMultiselect);
    this.filter$ = this.store.select(CompaniesSelectors.selectFilter);
    this.multiselectActive$ = this.store.select(CompaniesSelectors.selectMultiselectActive);
    this.filteredCompanies$ = this.assignCompanyToParentFormControl.valueChanges.pipe(
      debounceTime(250),
      switchMap(searchString => (searchString ? this.filterCompanies(searchString) : this.filterCompanies()))
    );
  }

  filterCompanies(searchString?: string): Observable<Company[]> {
    return this.adminUsersCompaniesService
      .getCompanies(removeEmpty({ searchString, hasNoParent: true }), { size: 10, index: 0 })
      .pipe(map((companies: CompanyListResponse) => companies.data));
  }

  onClearMultiselectClick(): void {
    this.store.dispatch(CompaniesActions.multiselectClear());
  }

  updateFilter(filter: CompanyListFilter): void {
    this.store.dispatch(CompaniesActions.changeFilter({ filter }));
  }

  assignToParent(parentCompany: Company): void {
    this.assignCompanyToParentFormControl.reset();
    this.companiesToolbarStore.assignToParent(parentCompany);
  }

  exportCompanyList(): void {
    this.store.dispatch(CompaniesActions.exportList());
  }
}
