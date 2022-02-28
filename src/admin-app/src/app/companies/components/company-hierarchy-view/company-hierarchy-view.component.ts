import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { Company, CompanyListResponse } from '@solargis/types/user-company';
import { removeEmpty } from '@solargis/types/utils';

import { companyRefToString } from 'ng-shared/shared/utils/company.utils';

import { OrdersActions } from '../../../orders/store';
import { AdminUsersCompaniesService } from '../../../shared/services/admin-users-companies.service';
import { DetailNavigationService } from '../../../shared/services/detail-navigation.service';
import { fromAdmin } from '../../../store';
import { CompanyDetailStore } from '../../services/company-detail.store';

@Component({
  selector: 'sg-admin-company-hierarchy-view',
  styleUrls: ['../../../shared/components/admin-common.styles.scss', './company-hierarchy-view.component.scss'],
  templateUrl: './company-hierarchy-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyHierarchyViewComponent implements OnInit {
  companyRefToString = companyRefToString;

  @Input() company: Company;

  addChildFormControl = new FormControl();
  filteredCompanies$: Observable<Company[]>;

  constructor(
    readonly companyDetailStore: CompanyDetailStore,
    readonly detailNavigationService: DetailNavigationService,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly store: Store<fromAdmin.State>,
    private readonly router: Router
  ) {}

  addChild(company: Company): void {
    this.addChildFormControl.reset();
    this.companyDetailStore.addChild(company);
  }

  ngOnInit(): void {
    this.filteredCompanies$ = this.addChildFormControl.valueChanges.pipe(
      debounceTime(250),
      switchMap(company => (company ? this.filterCompanies(company) : this.filterCompanies()))
    );
  }

  filterCompanies(searchString?: string): Observable<Company[]> {
    return this.adminUsersCompaniesService
      .getCompanies(removeEmpty({ searchString, hasNoParent: true }), {
        size: 10,
        index: 0
      })
      .pipe(
        map((companies: CompanyListResponse) => companies.data),
        map((companies: Company[]) => companies.filter(company => company.sgCompanyId !== this.company.sgCompanyId))
      );
  }

  onShowOrdersClick(sgCompanyId: string): void {
    this.store.dispatch(OrdersActions.changeFilter({ filter: { company: { sgCompanyId } } }));
    this.router.navigate(['/', { outlets: { primary: 'list/orders' } }]);
  }
}
