import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';

import { AdminUsersCompaniesService } from '../../shared/services/admin-users-companies.service';
import { fromAdmin } from '../../store';
import { companyIdRouteParamName } from '../companies.constants';
import { CompaniesActions, CompaniesSelectors } from '../store';

@Injectable({
  providedIn: 'root'
})
export class CompanyDetailGuard implements CanActivate {
  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly adminUsersCompaniesService: AdminUsersCompaniesService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.isCompany(route.paramMap.get(companyIdRouteParamName));
  }

  private isCompany(id: string): Observable<boolean> {
    return this.isCompanyInStore(id).pipe(
      first(),
      switchMap(inStore => (inStore ? of(true) : this.isCompanyInApi(id)))
    );
  }

  private isCompanyInStore(id: string): Observable<boolean> {
    return this.store.select(CompaniesSelectors.selectById(id)).pipe(
      map(company => {
        if (!isNil(company)) {
          this.store.dispatch(CompaniesActions.select({ company }));
          return true;
        }
        return false;
      }, first())
    );
  }

  private isCompanyInApi(id: string): Observable<boolean> {
    return this.adminUsersCompaniesService.getCompany(id).pipe(
      map(company => CompaniesActions.select({ company })),
      tap(selectCompanyAction => this.store.dispatch(selectCompanyAction)),
      map(() => true),
      catchError(() => {
        this.router.navigate(['list', 'companies']);
        return of(false);
      })
    );
  }
}
