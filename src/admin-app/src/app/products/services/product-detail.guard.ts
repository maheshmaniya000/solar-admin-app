import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';

import { AdminProductsService } from '../../shared/services/admin-products.service';
import { fromAdmin } from '../../store';
import { ProductsActions, ProductsSelectors } from '../store';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailGuard implements CanActivate {
  constructor(
    private readonly store: Store<fromAdmin.State>,
    private readonly adminProductsService: AdminProductsService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.isProduct(route.paramMap.get('code'));
  }

  private isProduct(code: string): Observable<boolean> {
    return this.isProductInStore(code).pipe(
      first(),
      switchMap(inStore => (inStore ? of(true) : this.isProductInApi(code)))
    );
  }

  private isProductInStore(code: string): Observable<boolean> {
    return this.store.select(ProductsSelectors.selectByCode(code)).pipe(map(product => !isNil(product), first()));
  }

  private isProductInApi(code: string): Observable<boolean> {
    return this.adminProductsService.getProduct(code).pipe(
      map(product => ProductsActions.select({ product })),
      tap(selectProductAction => this.store.dispatch(selectProductAction)),
      map(() => true),
      catchError(() => {
        this.router.navigate(['list', 'products']);
        return of(false);
      })
    );
  }
}
